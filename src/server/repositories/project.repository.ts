/**
 * Project Repository
 * Menangani semua operasi database untuk Project
 */

import { db } from "@/server/db";
import { ProjectStatus } from "@/server/schema/enums";
import type { CreateProjectInput, UpdateProjectInput } from "@/server/schema";
import { Prisma } from "@prisma/client";

// Type untuk project dengan relasi lengkap
export type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: {
    createdBy: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    expenses: {
      include: {
        category: true;
      };
    };
    projectRevisions: {
      include: {
        changedBy: {
          select: {
            id: true;
            name: true;
            email: true;
          };
        };
      };
    };
    _count: {
      select: {
        expenses: true;
        projectRevisions: true;
      };
    };
  };
}>;

export class ProjectRepository {
  /**
   * Get all projects dengan pagination dan filter
   */
  async findAll(params: {
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
    const {
      page = 1,
      limit = 10,
      search,
      status,
      clientName,
      fromDate,
      toDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ProjectWhereInput = {
      ...(search && {
        OR: [
          { projectName: { contains: search, mode: "insensitive" } },
          { clientName: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(status && { status }),
      ...(clientName && { clientName: { contains: clientName, mode: "insensitive" } }),
      ...(fromDate && { createdAt: { gte: new Date(fromDate) } }),
      ...(toDate && { createdAt: { lte: new Date(toDate) } }),
    };

    // Get total count
    const total = await db.project.count({ where });

    // Get projects
    const projects = await db.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            expenses: true,
            projectRevisions: true,
          },
        },
      },
    });

    return {
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get project by ID
   */
  async findById(id: string) {
    const project = await db.project.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        expenses: {
          orderBy: { expenseDate: "desc" },
          include: {
            category: true,
            recordedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        projectRevisions: {
          orderBy: { changedAt: "desc" },
          include: {
            changedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            expenses: true,
            projectRevisions: true,
          },
        },
      },
    });

    if (!project) {
      return null;
    }

    // Fetch reimbursements and direct expenses separately to get submitter info
    const reimbursements = await db.reimbursement.findMany({
      where: { projectId: id },
      select: {
        id: true,
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const directExpenses = await db.directExpenseRequest.findMany({
      where: { projectId: id },
      select: {
        id: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create lookup maps
    const reimbursementMap = new Map(
      reimbursements.map((r) => [r.id, r.submittedBy])
    );
    const directExpenseMap = new Map(
      directExpenses.map((d) => [d.id, d.createdBy])
    );

    // Enhance expenses with source information
    const enhancedExpenses = project.expenses.map((expense) => ({
      ...expense,
      sourceType: expense.sourceType,
      sourceSubmitter:
        expense.sourceType === "REIMBURSEMENT"
          ? reimbursementMap.get(expense.sourceId)
          : directExpenseMap.get(expense.sourceId),
    }));

    return {
      ...project,
      expenses: enhancedExpenses,
    };
  }

  async create(data: CreateProjectInput, createdById: string) {
    return await db.project.create({
      data: {
        projectName: data.projectName,
        clientName: data.clientName,
        projectValue: data.projectValue,
        deadline: new Date(data.deadline),
        status: data.status || ProjectStatus.ACTIVE,
        description: data.description,
        createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            expenses: true,
            projectRevisions: true,
          },
        },
      },
    });
  }

  /**
   * Update project
   */
  async update(id: string, data: UpdateProjectInput) {
    return await db.project.update({
      where: { id },
      data: {
        ...(data.projectName && { projectName: data.projectName }),
        ...(data.clientName && { clientName: data.clientName }),
        ...(data.projectValue !== undefined && { projectValue: data.projectValue }),
        ...(data.deadline && { deadline: new Date(data.deadline) }),
        ...(data.status && { status: data.status }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            expenses: true,
            projectRevisions: true,
          },
        },
      },
    });
  }

  /**
   * Update project status
   */
  async updateStatus(id: string, status: ProjectStatus) {
    return await db.project.update({
      where: { id },
      data: { status },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Delete project
   */
  async delete(id: string) {
    return await db.project.delete({
      where: { id },
    });
  }

  /**
   * Get project statistics
   */
  async getStats() {
    const [total, activeProjects, completedProjects, cancelledProjects, onHoldProjects] =
      await Promise.all([
        db.project.count(),
        db.project.count({ where: { status: ProjectStatus.ACTIVE } }),
        db.project.count({ where: { status: ProjectStatus.COMPLETED } }),
        db.project.count({ where: { status: ProjectStatus.CANCELLED } }),
        db.project.count({ where: { status: ProjectStatus.ON_HOLD } }),
      ]);

    // Get total project value by status
    const projectValues = await db.project.groupBy({
      by: ["status"],
      _sum: {
        projectValue: true,
      },
    });

    return {
      total,
      active: activeProjects,
      completed: completedProjects,
      cancelled: cancelledProjects,
      onHold: onHoldProjects,
      totalValueByStatus: projectValues.map((pv) => ({
        status: pv.status,
        totalValue: pv._sum.projectValue?.toString() || "0",
      })),
    };
  }

  /**
   * Get total expenses for a project
   */
  async getProjectExpenses(projectId: string) {
    const expenses = await db.expense.aggregate({
      where: { projectId },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    return {
      totalExpenses: expenses._sum.amount?.toString() || "0",
      expenseCount: expenses._count,
    };
  }

  /**
   * Create project revision
   */
  async createRevision(data: {
    projectId: string;
    oldValue: number | string;
    newValue: number | string;
    reason: string;
    changedById: string;
  }) {
    return await db.projectRevision.create({
      data: {
        projectId: data.projectId,
        oldValue: data.oldValue,
        newValue: data.newValue,
        reason: data.reason,
        changedById: data.changedById,
      },
      include: {
        changedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}

export const projectRepository = new ProjectRepository();
