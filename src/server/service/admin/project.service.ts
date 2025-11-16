/**
 * Admin Project Service
 * Business logic untuk admin mengelola projects
 */

import { projectRepository, type ProjectWithRelations } from "@/server/repositories/project.repository";
import { ProjectStatus } from "@/server/schema/enums";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  CreateProjectRevisionInput,
} from "@/server/schema";

export class AdminProjectService {
  /**
   * Get all projects
   */
  async getAllProjects(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: ProjectStatus;
    clientName?: string;
    fromDate?: Date | string;
    toDate?: Date | string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    return await projectRepository.findAll(params);
  }

  /**
   * Get project by ID with expenses
   */
  async getProjectById(id: string): Promise<ProjectWithRelations & { totalExpenses: number; remainingBudget: number }> {
    const project = await projectRepository.findById(id);

    if (!project) {
      throw new Error("Project not found");
    }

    // Calculate total expenses
    const totalExpenses = project.expenses.reduce((sum: number, expense) => {
      return sum + Number(expense.amount);
    }, 0);

    return {
      ...project,
      totalExpenses,
      remainingBudget: Number(project.projectValue) - totalExpenses,
    };
  }

  /**
   * Create new project
   */
  async createProject(data: CreateProjectInput, createdById: string) {
    // Validate deadline is in the future
    const deadlineDate = new Date(data.deadline);
    if (deadlineDate < new Date()) {
      throw new Error("Deadline must be in the future");
    }

    const project = await projectRepository.create(data, createdById);
    return project;
  }

  /**
   * Update project
   */
  async updateProject(
    id: string,
    data: UpdateProjectInput,
    updatedById: string
  ) {
    // Check if project exists
    const existingProject = await projectRepository.findById(id);
    if (!existingProject) {
      throw new Error("Project not found");
    }

    // If project value is being updated, create a revision
    if (
      data.projectValue !== undefined &&
      Number(data.projectValue) !== Number(existingProject.projectValue)
    ) {
      // Project value changes require a revision record
      // This will be handled separately through updateProjectValue method
      throw new Error(
        "Use updateProjectValue endpoint to change project value"
      );
    }

    // Validate deadline if provided
    if (data.deadline) {
      const deadlineDate = new Date(data.deadline);
      if (deadlineDate < new Date() && existingProject.status === ProjectStatus.ACTIVE) {
        throw new Error("Deadline must be in the future for active projects");
      }
    }

    const project = await projectRepository.update(id, data);
    return project;
  }

  /**
   * Update project value with revision tracking
   */
  async updateProjectValue(
    id: string,
    data: {
      newValue: number | string;
      reason: string;
    },
    changedById: string
  ) {
    // Check if project exists
    const existingProject = await projectRepository.findById(id);
    if (!existingProject) {
      throw new Error("Project not found");
    }

    // Validate new value
    const newValue = Number(data.newValue);
    if (newValue <= 0) {
      throw new Error("Project value must be positive");
    }

    const oldValue = Number(existingProject.projectValue);
    if (newValue === oldValue) {
      throw new Error("New value must be different from current value");
    }

    // Create revision record
    await projectRepository.createRevision({
      projectId: id,
      oldValue,
      newValue,
      reason: data.reason,
      changedById,
    });

    // Update project value
    const project = await projectRepository.update(id, {
      projectValue: newValue,
    });

    return project;
  }

  /**
   * Complete project
   */
  async completeProject(id: string) {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.status === ProjectStatus.COMPLETED) {
      throw new Error("Project is already completed");
    }

    if (project.status === ProjectStatus.CANCELLED) {
      throw new Error("Cannot complete a cancelled project");
    }

    return await projectRepository.updateStatus(id, ProjectStatus.COMPLETED);
  }

  /**
   * Cancel project
   */
  async cancelProject(id: string) {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.status === ProjectStatus.COMPLETED) {
      throw new Error("Cannot cancel a completed project");
    }

    if (project.status === ProjectStatus.CANCELLED) {
      throw new Error("Project is already cancelled");
    }

    return await projectRepository.updateStatus(id, ProjectStatus.CANCELLED);
  }

  /**
   * Reactivate project
   */
  async reactivateProject(id: string) {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.status === ProjectStatus.ACTIVE) {
      throw new Error("Project is already active");
    }

    if (project.status === ProjectStatus.COMPLETED) {
      throw new Error("Cannot reactivate a completed project");
    }

    return await projectRepository.updateStatus(id, ProjectStatus.ACTIVE);
  }

  /**
   * Delete project
   */
  async deleteProject(id: string) {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if project has expenses
    if (project._count.expenses > 0) {
      throw new Error(
        "Cannot delete project with expenses. Please delete expenses first."
      );
    }

    return await projectRepository.delete(id);
  }

  /**
   * Get project statistics
   */
  async getProjectStats() {
    return await projectRepository.getStats();
  }

  /**
   * Get project expenses summary
   */
  async getProjectExpensesSummary(id: string) {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }

    const expenses = await projectRepository.getProjectExpenses(id);
    return {
      projectValue: project.projectValue.toString(),
      totalExpenses: expenses.totalExpenses,
      expenseCount: expenses.expenseCount,
      remainingBudget: (
        Number(project.projectValue) - Number(expenses.totalExpenses)
      ).toString(),
    };
  }
}

export const adminProjectService = new AdminProjectService();
