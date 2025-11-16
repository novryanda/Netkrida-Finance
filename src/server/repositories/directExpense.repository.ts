/**
 * Direct Expense Repository
 * Handle database operations untuk DirectExpenseRequest
 */

import { db } from "../db";
import { DirectExpenseStatus, ExpenseSourceType } from "../schema/enums";
import type {
  CreateDirectExpenseInput,
  GetDirectExpensesInput,
  ApproveDirectExpenseInput,
  RejectDirectExpenseInput,
  MarkDirectExpenseAsPaidInput,
} from "../schema/directExpense.schema";

export class DirectExpenseRepository {
  /**
   * Create new direct expense request
   */
  async create(data: CreateDirectExpenseInput, createdById: string) {
    return await db.directExpenseRequest.create({
      data: {
        ...data,
        expenseDate: new Date(data.expenseDate),
        createdById,
      },
      include: {
        project: {
          select: {
            id: true,
            projectName: true,
            clientName: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Get direct expense by ID
   */
  async findById(id: string) {
    return await db.directExpenseRequest.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            projectName: true,
            clientName: true,
            projectValue: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        paidBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Get all direct expenses with filters
   */
  async findMany(filters: GetDirectExpensesInput) {
    const {
      status,
      projectId,
      categoryId,
      createdById,
      page,
      limit,
      startDate,
      endDate,
    } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) where.status = status;
    if (projectId) where.projectId = projectId;
    if (categoryId) where.categoryId = categoryId;
    if (createdById) where.createdById = createdById;

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = new Date(startDate);
      if (endDate) where.expenseDate.lte = new Date(endDate);
    }

    console.log('[Repository] DirectExpense findMany where:', JSON.stringify(where, null, 2));

    const [directExpenses, total] = await Promise.all([
      db.directExpenseRequest.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              projectName: true,
              clientName: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              name: true,
            },
          },
          paidBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.directExpenseRequest.count({ where }),
    ]);

    console.log('[Repository] DirectExpense findMany result:', {
      count: directExpenses.length,
      total,
      firstItem: directExpenses[0]?.id,
      statuses: directExpenses.map(e => e.status)
    });

    return {
      directExpenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Approve direct expense (ADMIN only)
   */
  async approve(
    id: string,
    approvedById: string,
    data: ApproveDirectExpenseInput
  ) {
    return await db.directExpenseRequest.update({
      where: { id },
      data: {
        status: DirectExpenseStatus.APPROVED,
        approvedById,
        approvedAt: new Date(),
        approvalNotes: data.approvalNotes,
      },
      include: {
        project: true,
        category: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Reject direct expense (ADMIN only)
   */
  async reject(id: string, data: RejectDirectExpenseInput) {
    return await db.directExpenseRequest.update({
      where: { id },
      data: {
        status: DirectExpenseStatus.REJECTED,
        rejectionReason: data.rejectionReason,
        rejectedAt: new Date(),
      },
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
   * Mark as paid (FINANCE only - must be creator)
   */
  async markAsPaid(
    id: string,
    paidById: string,
    data: MarkDirectExpenseAsPaidInput
  ) {
    // Start transaction
    return await db.$transaction(async (tx) => {
      // Update direct expense request
      const directExpense = await tx.directExpenseRequest.update({
        where: { id },
        data: {
          status: DirectExpenseStatus.PAID,
          paidById,
          paidAt: new Date(),
          paymentProofUrl: data.paymentProofUrl,
          paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
          paymentNotes: data.paymentNotes,
        },
        include: {
          project: true,
          category: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Create expense record (final recording)
      const expense = await tx.expense.create({
        data: {
          projectId: directExpense.projectId,
          categoryId: directExpense.categoryId,
          sourceType: ExpenseSourceType.DIRECT_EXPENSE,
          sourceId: directExpense.id,
          description: directExpense.description,
          amount: directExpense.amount,
          expenseDate: directExpense.expenseDate,
          receiptUrl: directExpense.invoiceUrl,
          paymentProofUrl: data.paymentProofUrl,
          recordedById: paidById,
        },
      });

      return { directExpense, expense };
    });
  }

  /**
   * Get pending direct expenses (for ADMIN approval)
   */
  async findPending(page: number = 1, limit: number = 20) {
    return this.findMany({
      status: DirectExpenseStatus.PENDING,
      page,
      limit,
    });
  }

  /**
   * Get approved direct expenses to pay (for FINANCE who created)
   */
  async findApprovedToPay(createdById: string, page: number = 1, limit: number = 20) {
    return this.findMany({
      status: DirectExpenseStatus.APPROVED,
      createdById,
      page,
      limit,
    });
  }

  /**
   * Check if user is creator
   */
  async isCreator(id: string, userId: string): Promise<boolean> {
    const directExpense = await db.directExpenseRequest.findUnique({
      where: { id },
      select: { createdById: true },
    });

    return directExpense?.createdById === userId;
  }

  /**
   * Get total amount of direct expenses
   */
  async getTotalAmount(where: any = {}): Promise<number> {
    const result = await db.directExpenseRequest.aggregate({
      where,
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount?.toNumber() || 0;
  }
}

export const directExpenseRepository = new DirectExpenseRepository();
