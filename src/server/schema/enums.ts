/**
 * Enums Schema
 * Definisi enum yang digunakan di seluruh aplikasi
 * Sesuai dengan Prisma schema
 */

export enum UserRole {
  ADMIN = "ADMIN",
  FINANCE = "FINANCE",
  STAFF = "STAFF",
}

export enum ProjectStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  ON_HOLD = "ON_HOLD",
}

export enum ExpenseType {
  DIRECT = "DIRECT",
  REIMBURSEMENT = "REIMBURSEMENT",
}

export enum ReimbursementStatus {
  PENDING = "PENDING",
  REVIEWED = "REVIEWED",
  APPROVED = "APPROVED",
  PAID = "PAID",
  REJECTED = "REJECTED",
}

export enum DirectExpenseStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  PAID = "PAID",
  REJECTED = "REJECTED",
}

export enum ExpenseSourceType {
  REIMBURSEMENT = "REIMBURSEMENT",
  DIRECT_EXPENSE = "DIRECT_EXPENSE",
}

// Helper functions untuk label yang lebih user-friendly
export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrator",
  [UserRole.FINANCE]: "Finance",
  [UserRole.STAFF]: "Staff",
};

export const ProjectStatusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: "Active",
  [ProjectStatus.COMPLETED]: "Completed",
  [ProjectStatus.CANCELLED]: "Cancelled",
  [ProjectStatus.ON_HOLD]: "On Hold",
};

export const ExpenseTypeLabels: Record<ExpenseType, string> = {
  [ExpenseType.DIRECT]: "Direct Expense",
  [ExpenseType.REIMBURSEMENT]: "Reimbursement",
};

export const ReimbursementStatusLabels: Record<ReimbursementStatus, string> = {
  [ReimbursementStatus.PENDING]: "Pending",
  [ReimbursementStatus.REVIEWED]: "Reviewed",
  [ReimbursementStatus.APPROVED]: "Approved",
  [ReimbursementStatus.PAID]: "Paid",
  [ReimbursementStatus.REJECTED]: "Rejected",
};

export const DirectExpenseStatusLabels: Record<DirectExpenseStatus, string> = {
  [DirectExpenseStatus.PENDING]: "Pending",
  [DirectExpenseStatus.APPROVED]: "Approved",
  [DirectExpenseStatus.PAID]: "Paid",
  [DirectExpenseStatus.REJECTED]: "Rejected",
};

export const ExpenseSourceTypeLabels: Record<ExpenseSourceType, string> = {
  [ExpenseSourceType.REIMBURSEMENT]: "Reimbursement",
  [ExpenseSourceType.DIRECT_EXPENSE]: "Direct Expense",
};

// Helper functions untuk badge colors
export const ProjectStatusColors: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: "bg-green-100 text-green-800",
  [ProjectStatus.COMPLETED]: "bg-blue-100 text-blue-800",
  [ProjectStatus.CANCELLED]: "bg-red-100 text-red-800",
  [ProjectStatus.ON_HOLD]: "bg-yellow-100 text-yellow-800",
};

export const ReimbursementStatusColors: Record<ReimbursementStatus, string> = {
  [ReimbursementStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [ReimbursementStatus.REVIEWED]: "bg-blue-100 text-blue-800",
  [ReimbursementStatus.APPROVED]: "bg-green-100 text-green-800",
  [ReimbursementStatus.PAID]: "bg-emerald-100 text-emerald-800",
  [ReimbursementStatus.REJECTED]: "bg-red-100 text-red-800",
};

export const DirectExpenseStatusColors: Record<DirectExpenseStatus, string> = {
  [DirectExpenseStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [DirectExpenseStatus.APPROVED]: "bg-green-100 text-green-800",
  [DirectExpenseStatus.PAID]: "bg-emerald-100 text-emerald-800",
  [DirectExpenseStatus.REJECTED]: "bg-red-100 text-red-800",
};
