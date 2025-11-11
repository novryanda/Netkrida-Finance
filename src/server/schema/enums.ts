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
  APPROVED = "APPROVED",
  PAID = "PAID",
  REJECTED = "REJECTED",
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
  [ReimbursementStatus.APPROVED]: "Approved",
  [ReimbursementStatus.PAID]: "Paid",
  [ReimbursementStatus.REJECTED]: "Rejected",
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
  [ReimbursementStatus.APPROVED]: "bg-blue-100 text-blue-800",
  [ReimbursementStatus.PAID]: "bg-green-100 text-green-800",
  [ReimbursementStatus.REJECTED]: "bg-red-100 text-red-800",
};
