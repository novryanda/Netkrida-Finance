/**
 * Reimbursement Service
 * Business logic untuk Reimbursement Flow
 */

import { reimbursementRepository } from "../../repositories/reimbursement.repository";
import { ReimbursementStatus, UserRole } from "../../schema/enums";
import type {
  CreateReimbursementInput,
  ReimbursementFilter,
  ReviewReimbursementInput,
  ApproveReimbursementInput,
  RejectReimbursementInput,
  PayReimbursementInput,
} from "../../schema/reimbursement.schema";

export class ReimbursementService {
  /**
   * Submit reimbursement (STAFF)
   */
  async submitReimbursement(
    data: CreateReimbursementInput,
    submittedById: string
  ) {
    return await reimbursementRepository.create(data, submittedById);
  }

  /**
   * Get reimbursement by ID
   */
  async getReimbursementById(id: string) {
    const reimbursement = await reimbursementRepository.findById(id);
    if (!reimbursement) {
      throw new Error("Reimbursement not found");
    }
    return reimbursement;
  }

  /**
   * Get reimbursements with filters
   */
  async getReimbursements(filters: ReimbursementFilter) {
    console.log('[Reimbursement Service] getReimbursements called with filters:', JSON.stringify(filters, null, 2));
    const result = await reimbursementRepository.findMany(filters);
    console.log('[Reimbursement Service] getReimbursements result:', {
      count: result.reimbursements.length,
      total: result.pagination.total,
    });
    return result;
  }

  /**
   * Get my reimbursements (STAFF)
   */
  async getMyReimbursements(
    submittedById: string,
    filters: Partial<ReimbursementFilter>
  ) {
    return await reimbursementRepository.findMany({
      ...filters,
      submittedById,
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
      sortBy: filters.sortBy ?? "submittedAt",
      sortOrder: filters.sortOrder ?? "desc",
    });
  }

  /**
   * Get pending reimbursements to review (FINANCE)
   */
  async getPendingToReview(page: number = 1, limit: number = 20) {
    return await reimbursementRepository.findPendingToReview(page, limit);
  }

  /**
   * Get reviewed reimbursements to approve (ADMIN)
   */
  async getReviewedToApprove(page: number = 1, limit: number = 20) {
    return await reimbursementRepository.findReviewedToApprove(page, limit);
  }

  /**
   * Get approved reimbursements to pay (FINANCE who reviewed)
   */
  async getApprovedToPay(reviewedById: string, page: number = 1, limit: number = 20) {
    return await reimbursementRepository.findApprovedToPay(
      reviewedById,
      page,
      limit
    );
  }

  /**
   * Review reimbursement - Approve & Forward to ADMIN (FINANCE)
   */
  async reviewReimbursement(
    id: string,
    reviewedById: string,
    data: ReviewReimbursementInput
  ) {
    const reimbursement = await reimbursementRepository.findById(id);

    if (!reimbursement) {
      throw new Error("Reimbursement not found");
    }

    if (reimbursement.status !== ReimbursementStatus.PENDING) {
      throw new Error(
        `Cannot review reimbursement with status ${reimbursement.status}`
      );
    }

    return await reimbursementRepository.review(id, reviewedById, data);
    // TODO: Send notification to ADMIN
  }

  /**
   * Reject reimbursement (FINANCE)
   */
  async rejectByFinance(
    id: string,
    rejectedById: string,
    data: RejectReimbursementInput
  ) {
    const reimbursement = await reimbursementRepository.findById(id);

    if (!reimbursement) {
      throw new Error("Reimbursement not found");
    }

    if (reimbursement.status !== ReimbursementStatus.PENDING) {
      throw new Error(
        `Cannot reject reimbursement with status ${reimbursement.status}`
      );
    }

    return await reimbursementRepository.reject(id, rejectedById, data);
    // TODO: Send notification to STAFF
  }

  /**
   * Approve reimbursement (ADMIN)
   */
  async approveReimbursement(
    id: string,
    approvedById: string,
    data: ApproveReimbursementInput
  ) {
    const reimbursement = await reimbursementRepository.findById(id);

    if (!reimbursement) {
      throw new Error("Reimbursement not found");
    }

    if (reimbursement.status !== ReimbursementStatus.REVIEWED) {
      throw new Error(
        `Cannot approve reimbursement with status ${reimbursement.status}. Must be REVIEWED first.`
      );
    }

    return await reimbursementRepository.approve(id, approvedById, data);
    // TODO: Send notification to FINANCE (reviewer) and STAFF
  }

  /**
   * Reject reimbursement (ADMIN)
   */
  async rejectByAdmin(
    id: string,
    rejectedById: string,
    data: RejectReimbursementInput
  ) {
    const reimbursement = await reimbursementRepository.findById(id);

    if (!reimbursement) {
      throw new Error("Reimbursement not found");
    }

    if (reimbursement.status !== ReimbursementStatus.REVIEWED) {
      throw new Error(
        `Cannot reject reimbursement with status ${reimbursement.status}`
      );
    }

    return await reimbursementRepository.reject(id, rejectedById, data);
    // TODO: Send notification to FINANCE (reviewer) and STAFF
  }

  /**
   * Mark as paid (FINANCE - must be reviewer)
   */
  async markAsPaid(
    id: string,
    paidById: string,
    data: PayReimbursementInput
  ) {
    const reimbursement = await reimbursementRepository.findById(id);

    if (!reimbursement) {
      throw new Error("Reimbursement not found");
    }

    if (reimbursement.status !== ReimbursementStatus.APPROVED) {
      throw new Error(
        `Cannot pay reimbursement with status ${reimbursement.status}`
      );
    }

    // Check if user is the reviewer
    const isReviewer = await reimbursementRepository.isReviewer(id, paidById);
    if (!isReviewer) {
      throw new Error(
        "Only the FINANCE who reviewed this reimbursement can mark it as paid"
      );
    }

    const result = await reimbursementRepository.markAsPaid(id, paidById, data);
    // TODO: Send notification to STAFF and ADMIN

    return result;
  }

  /**
   * Get reimbursement statistics
   */
  async getStatistics(userId?: string, role?: UserRole) {
    const where: any = {};

    if (role === UserRole.STAFF && userId) {
      where.submittedById = userId;
    }

    const [total, pending, reviewed, approved, paid, rejected, totalAmountResult] =
      await Promise.all([
        reimbursementRepository.findMany({
          ...where,
          page: 1,
          limit: 1,
        }),
        reimbursementRepository.findMany({
          ...where,
          status: ReimbursementStatus.PENDING,
          page: 1,
          limit: 1,
        }),
        reimbursementRepository.findMany({
          ...where,
          status: ReimbursementStatus.REVIEWED,
          page: 1,
          limit: 1,
        }),
        reimbursementRepository.findMany({
          ...where,
          status: ReimbursementStatus.APPROVED,
          page: 1,
          limit: 1,
        }),
        reimbursementRepository.findMany({
          ...where,
          status: ReimbursementStatus.PAID,
          page: 1,
          limit: 1,
        }),
        reimbursementRepository.findMany({
          ...where,
          status: ReimbursementStatus.REJECTED,
          page: 1,
          limit: 1,
        }),
        reimbursementRepository.getTotalAmount(where),
      ]);

    return {
      total: total.pagination.total,
      pending: pending.pagination.total,
      reviewed: reviewed.pagination.total,
      approved: approved.pagination.total,
      paid: paid.pagination.total,
      rejected: rejected.pagination.total,
      totalAmount: totalAmountResult,
    };
  }
}

export const reimbursementService = new ReimbursementService();
