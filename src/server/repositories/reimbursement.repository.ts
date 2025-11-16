/**
 * Reimbursement Repository
 * Handle database operations untuk Reimbursement
 */

import { db } from "../db";
import { ReimbursementStatus, ExpenseSourceType } from "../schema/enums";
import type {
  CreateReimbursementInput,
  ReimbursementFilter,
  ReviewReimbursementInput,
  ApproveReimbursementInput,
  RejectReimbursementInput,
  PayReimbursementInput,
} from "../schema/reimbursement.schema";

export class ReimbursementRepository {
  /**
   * Create new reimbursement (Submit by STAFF)
   */
  async create(data: CreateReimbursementInput, submittedById: string) {
    return await db.reimbursement.create({
      data: {
        ...data,
        expenseDate: new Date(data.expenseDate),
        submittedById,
      },
      include: {
        project: {
          select: {
            id: true,
            projectName: true,
            clientName: true,
          },
        },
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            bankName: true,
            bankAccountNo: true,
          },
        },
      },
    });
  }

  /**
   * Get reimbursement by ID
   */
  async findById(id: string) {
    return await db.reimbursement.findUnique({
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
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            bankName: true,
            bankAccountNo: true,
          },
        },
        reviewedBy: {
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
   * Get all reimbursements with filters
   */
  async findMany(filters: ReimbursementFilter) {
    const {
      status,
      submittedById,
      reviewedById,
      projectId,
      search,
      fromDate,
      toDate,
      page,
      limit,
      sortBy,
      sortOrder,
    } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) where.status = status;
    if (submittedById) where.submittedById = submittedById;
    if (reviewedById) where.reviewedById = reviewedById;
    if (projectId) where.projectId = projectId;

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { submittedBy: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (fromDate || toDate) {
      where.submittedAt = {};
      if (fromDate) where.submittedAt.gte = new Date(fromDate);
      if (toDate) where.submittedAt.lte = new Date(toDate);
    }

    console.log('[Reimbursement Repository] findMany where clause:', JSON.stringify(where, null, 2));

    const [reimbursements, total] = await Promise.all([
      db.reimbursement.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              projectName: true,
              clientName: true,
            },
          },
          submittedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          reviewedBy: {
            select: {
              id: true,
              name: true,
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
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.reimbursement.count({ where }),
    ]);

    console.log('[Reimbursement Repository] Result:', {
      count: reimbursements.length,
      total,
      statuses: reimbursements.map(r => r.status),
    });

    return {
      reimbursements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Review reimbursement (FINANCE - approve & forward to ADMIN)
   */
  async review(id: string, reviewedById: string, data: ReviewReimbursementInput) {
    return await db.reimbursement.update({
      where: { id },
      data: {
        status: ReimbursementStatus.REVIEWED,
        reviewedById,
        reviewedAt: new Date(),
        reviewNotes: data.reviewNotes,
      },
      include: {
        project: true,
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Approve reimbursement (ADMIN)
   */
  async approve(id: string, approvedById: string, data: ApproveReimbursementInput) {
    return await db.reimbursement.update({
      where: { id },
      data: {
        status: ReimbursementStatus.APPROVED,
        approvedById,
        approvedAt: new Date(),
        approvalNotes: data.approvalNotes,
      },
      include: {
        project: true,
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewedBy: {
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
   * Reject reimbursement (FINANCE or ADMIN)
   */
  async reject(id: string, rejectedBy: string, data: RejectReimbursementInput) {
    return await db.reimbursement.update({
      where: { id },
      data: {
        status: ReimbursementStatus.REJECTED,
        rejectionReason: data.rejectionReason,
        rejectedBy,
        rejectedAt: new Date(),
      },
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewedBy: {
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
   * Mark as paid (FINANCE - must be reviewer)
   */
  async markAsPaid(id: string, paidById: string, data: PayReimbursementInput) {
    // Start transaction
    return await db.$transaction(async (tx) => {
      // Get reimbursement with category (we'll use first available category or create "Reimbursement" category)
      const reimburse = await tx.reimbursement.findUnique({
        where: { id },
        include: {
          project: true,
        },
      });

      if (!reimburse) {
        throw new Error("Reimbursement not found");
      }

      // Get or create "Reimbursement" category
      let category = await tx.expenseCategory.findFirst({
        where: { name: "Reimbursement" },
      });

      if (!category) {
        category = await tx.expenseCategory.create({
          data: {
            name: "Reimbursement",
            description: "Default category for staff reimbursements",
            createdById: paidById,
          },
        });
      }

      // Update reimbursement status
      const reimbursement = await tx.reimbursement.update({
        where: { id },
        data: {
          status: ReimbursementStatus.PAID,
          paidById,
          paidAt: new Date(),
          paymentProofUrl: data.paymentProofUrl,
          paymentNotes: data.paymentNotes,
        },
        include: {
          project: true,
          submittedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reviewedBy: {
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
      });

      // Create expense record (final recording)
      const expense = await tx.expense.create({
        data: {
          projectId: reimburse.projectId,
          categoryId: category.id,
          sourceType: ExpenseSourceType.REIMBURSEMENT,
          sourceId: reimburse.id,
          description: reimburse.description,
          amount: reimburse.amount,
          expenseDate: reimburse.expenseDate,
          receiptUrl: reimburse.receiptUrl,
          paymentProofUrl: data.paymentProofUrl,
          recordedById: paidById,
        },
      });

      return { reimbursement, expense };
    });
  }

  /**
   * Get pending reimbursements (for FINANCE review)
   */
  async findPendingToReview(page: number = 1, limit: number = 20) {
    return this.findMany({
      status: ReimbursementStatus.PENDING,
      page,
      limit,
      sortBy: "submittedAt",
      sortOrder: "asc",
    });
  }

  /**
   * Get reviewed reimbursements (for ADMIN approval)
   */
  async findReviewedToApprove(page: number = 1, limit: number = 20) {
    return this.findMany({
      status: ReimbursementStatus.REVIEWED,
      page,
      limit,
      sortBy: "reviewedAt",
      sortOrder: "asc",
    });
  }

  /**
   * Get approved reimbursements to pay (for FINANCE who reviewed)
   */
  async findApprovedToPay(reviewedById: string, page: number = 1, limit: number = 20) {
    return this.findMany({
      status: ReimbursementStatus.APPROVED,
      reviewedById,
      page,
      limit,
      sortBy: "approvedAt",
      sortOrder: "asc",
    });
  }

  /**
   * Check if user is reviewer
   */
  async isReviewer(id: string, userId: string): Promise<boolean> {
    const reimburse = await db.reimbursement.findUnique({
      where: { id },
      select: { reviewedById: true },
    });

    return reimburse?.reviewedById === userId;
  }

  /**
   * Get total amount of reimbursements
   */
  async getTotalAmount(where: any = {}): Promise<number> {
    const result = await db.reimbursement.aggregate({
      where,
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount?.toNumber() || 0;
  }
}

export const reimbursementRepository = new ReimbursementRepository();
