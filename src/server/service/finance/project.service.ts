/**
 * Finance Project Service
 * Service untuk role Finance - hanya read-only access
 */

import { projectRepository } from "@/server/repositories/project.repository";
import { ProjectStatus } from "@/server/schema/enums";

export class FinanceProjectService {
  /**
   * Get all projects (read-only untuk Finance)
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
    try {
      const result = await projectRepository.findAll(params);
      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
      };
    } catch (error) {
      console.error("Error getting projects:", error);
      return {
        success: false,
        error: "Failed to fetch projects",
      };
    }
  }

  /**
   * Get project by ID (read-only untuk Finance)
   */
  async getProjectById(id: string) {
    try {
      const project = await projectRepository.findById(id);

      if (!project) {
        return {
          success: false,
          error: "Project not found",
        };
      }

      return {
        success: true,
        data: project,
      };
    } catch (error) {
      console.error("Error getting project:", error);
      return {
        success: false,
        error: "Failed to fetch project",
      };
    }
  }

  /**
   * Get project statistics (read-only untuk Finance)
   */
  async getProjectStats() {
    try {
      const stats = await projectRepository.getStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error getting project stats:", error);
      return {
        success: false,
        error: "Failed to fetch project statistics",
      };
    }
  }

  /**
   * Get project expenses (read-only untuk Finance)
   */
  async getProjectExpenses(projectId: string) {
    try {
      const expenses = await projectRepository.getProjectExpenses(projectId);
      return {
        success: true,
        data: expenses,
      };
    } catch (error) {
      console.error("Error getting project expenses:", error);
      return {
        success: false,
        error: "Failed to fetch project expenses",
      };
    }
  }
}

export const financeProjectService = new FinanceProjectService();
