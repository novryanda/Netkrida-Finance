/**
 * Direct Expense Service
 * Business logic untuk Direct Expense Flow
 */

import { directExpenseRepository } from "../../repositories/directExpense.repository";
import { DirectExpenseStatus } from "../../schema/enums";
import type {
  CreateDirectExpenseInput,
  GetDirectExpensesInput,
  ApproveDirectExpenseInput,
  RejectDirectExpenseInput,
  MarkDirectExpenseAsPaidInput,
} from "../../schema/directExpense.schema";

export class DirectExpenseService {
  /**
   * Create direct expense request (FINANCE)
   */
  async createDirectExpense(
    data: CreateDirectExpenseInput,
    createdById: string
  ) {
    return await directExpenseRepository.create(data, createdById);
    // TODO: Send notification to ADMIN
  }

  /**
   * Get direct expense by ID
   */
  async getDirectExpenseById(id: string) {
    const directExpense = await directExpenseRepository.findById(id);
    if (!directExpense) {
      throw new Error("Direct expense not found");
    }
    return directExpense;
  }

  /**
   * Get direct expenses with filters
   */
  async getDirectExpenses(filters: GetDirectExpensesInput) {
    return await directExpenseRepository.findMany(filters);
  }

  /**
   * Get my direct expenses (FINANCE)
   */
  async getMyDirectExpenses(
    createdById: string,
    filters: Partial<GetDirectExpensesInput>
  ) {
    return await directExpenseRepository.findMany({
      ...filters,
      createdById,
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
    });
  }

  /**
   * Get pending direct expenses (ADMIN)
   */
  async getPending(page: number = 1, limit: number = 20) {
    return await directExpenseRepository.findPending(page, limit);
  }

  /**
   * Get approved direct expenses to pay (FINANCE who created)
   */
  async getApprovedToPay(createdById: string, page: number = 1, limit: number = 20) {
    return await directExpenseRepository.findApprovedToPay(
      createdById,
      page,
      limit
    );
  }

  /**
   * Approve direct expense (ADMIN)
   */
  async approveDirectExpense(
    id: string,
    approvedById: string,
    data: ApproveDirectExpenseInput
  ) {
    const directExpense = await directExpenseRepository.findById(id);

    if (!directExpense) {
      throw new Error("Direct expense not found");
    }

    if (directExpense.status !== DirectExpenseStatus.PENDING) {
      throw new Error(
        `Cannot approve direct expense with status ${directExpense.status}`
      );
    }

    return await directExpenseRepository.approve(id, approvedById, data);
    // TODO: Send notification to FINANCE (creator)
  }

  /**
   * Reject direct expense (ADMIN)
   */
  async rejectDirectExpense(
    id: string,
    data: RejectDirectExpenseInput
  ) {
    const directExpense = await directExpenseRepository.findById(id);

    if (!directExpense) {
      throw new Error("Direct expense not found");
    }

    if (directExpense.status !== DirectExpenseStatus.PENDING) {
      throw new Error(
        `Cannot reject direct expense with status ${directExpense.status}`
      );
    }

    return await directExpenseRepository.reject(id, data);
    // TODO: Send notification to FINANCE (creator)
  }

  /**
   * Mark as paid (FINANCE - any finance can pay approved expenses)
   */
  async markAsPaid(
    id: string,
    paidById: string,
    data: MarkDirectExpenseAsPaidInput
  ) {
    const directExpense = await directExpenseRepository.findById(id);

    if (!directExpense) {
      throw new Error("Direct expense not found");
    }

    if (directExpense.status !== DirectExpenseStatus.APPROVED) {
      throw new Error(
        `Cannot pay direct expense with status ${directExpense.status}. Must be APPROVED first.`
      );
    }

    const result = await directExpenseRepository.markAsPaid(id, paidById, data);
    // TODO: Send notification to ADMIN and creator

    return result;
  }

  /**
   * Get direct expense statistics
   */
  async getStatistics(createdById?: string) {
    const where: any = {};

    if (createdById) {
      where.createdById = createdById;
    }

    const [total, pending, approved, paid, rejected, totalAmountResult] = await Promise.all([
      directExpenseRepository.findMany({
        ...where,
        page: 1,
        limit: 1,
      }),
      directExpenseRepository.findMany({
        ...where,
        status: DirectExpenseStatus.PENDING,
        page: 1,
        limit: 1,
      }),
      directExpenseRepository.findMany({
        ...where,
        status: DirectExpenseStatus.APPROVED,
        page: 1,
        limit: 1,
      }),
      directExpenseRepository.findMany({
        ...where,
        status: DirectExpenseStatus.PAID,
        page: 1,
        limit: 1,
      }),
      directExpenseRepository.findMany({
        ...where,
        status: DirectExpenseStatus.REJECTED,
        page: 1,
        limit: 1,
      }),
      directExpenseRepository.getTotalAmount(where),
    ]);

    return {
      total: total.pagination.total,
      pending: pending.pagination.total,
      approved: approved.pagination.total,
      paid: paid.pagination.total,
      rejected: rejected.pagination.total,
      totalAmount: totalAmountResult,
    };
  }
}

export const directExpenseService = new DirectExpenseService();
