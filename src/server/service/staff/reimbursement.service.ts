/**
 * Staff Reimbursement Service
 * Business logic untuk STAFF reimbursement operations
 */

import { reimbursementRepository } from "../../repositories/reimbursement.repository";
import type {
  CreateReimbursementInput,
  ReimbursementFilter,
} from "../../schema/reimbursement.schema";

export class StaffReimbursementService {
  /**
   * Submit new reimbursement
   * @access STAFF only
   */
  async submitReimbursement(
    data: CreateReimbursementInput,
    staffId: string
  ) {
    return await reimbursementRepository.create(data, staffId);
    // TODO: Send notification to all FINANCE users
  }

  /**
   * Get my reimbursements
   * @access STAFF (view own only)
   */
  async getMyReimbursements(
    staffId: string,
    filters: Partial<ReimbursementFilter> = {}
  ) {
    return await reimbursementRepository.findMany({
      submittedById: staffId,
      status: filters.status,
      search: filters.search,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
      sortBy: filters.sortBy ?? "submittedAt",
      sortOrder: filters.sortOrder ?? "desc",
    });
  }

  /**
   * Get my reimbursement by ID
   * @access STAFF (view own only)
   */
  async getMyReimbursementById(id: string, staffId: string) {
    const reimbursement = await reimbursementRepository.findById(id);

    if (!reimbursement) {
      throw new Error("Reimbursement not found");
    }

    // Check ownership
    if (reimbursement.submittedById !== staffId) {
      throw new Error("Forbidden: You can only view your own reimbursements");
    }

    return reimbursement;
  }

  /**
   * Get reimbursement statistics for staff
   */
  async getMyStatistics(staffId: string) {
    const { pagination: total } = await reimbursementRepository.findMany({
      submittedById: staffId,
      page: 1,
      limit: 1,
      sortBy: "submittedAt",
      sortOrder: "desc",
    });

    const { pagination: pending } = await reimbursementRepository.findMany({
      submittedById: staffId,
      status: "PENDING" as any,
      page: 1,
      limit: 1,
      sortBy: "submittedAt",
      sortOrder: "desc",
    });

    const { pagination: reviewed } = await reimbursementRepository.findMany({
      submittedById: staffId,
      status: "REVIEWED" as any,
      page: 1,
      limit: 1,
      sortBy: "submittedAt",
      sortOrder: "desc",
    });

    const { pagination: approved } = await reimbursementRepository.findMany({
      submittedById: staffId,
      status: "APPROVED" as any,
      page: 1,
      limit: 1,
      sortBy: "submittedAt",
      sortOrder: "desc",
    });

    const { pagination: paid } = await reimbursementRepository.findMany({
      submittedById: staffId,
      status: "PAID" as any,
      page: 1,
      limit: 1,
      sortBy: "submittedAt",
      sortOrder: "desc",
    });

    const { pagination: rejected } = await reimbursementRepository.findMany({
      submittedById: staffId,
      status: "REJECTED" as any,
      page: 1,
      limit: 1,
      sortBy: "submittedAt",
      sortOrder: "desc",
    });

    return {
      total: total.total,
      pending: pending.total,
      reviewed: reviewed.total,
      approved: approved.total,
      paid: paid.total,
      rejected: rejected.total,
    };
  }
}

export const staffReimbursementService = new StaffReimbursementService();
