/**
 * Direct Expense Schema
 * Validasi untuk Direct Expense Request
 */

import { z } from "zod";
import { DirectExpenseStatus } from "./enums";

// Create Direct Expense Schema
export const createDirectExpenseSchema = z.object({
  projectId: z.string().optional().nullable().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  expenseDate: z.date().or(z.string()),
  invoiceUrl: z.string().url("Invalid invoice URL"),
}).transform((data) => ({
  ...data,
  // Convert empty string or null to undefined for projectId
  projectId: data.projectId && data.projectId !== "" ? data.projectId : undefined,
}));

// Approve Direct Expense Schema
export const approveDirectExpenseSchema = z.object({
  approvalNotes: z.string().optional(),
});

// Reject Direct Expense Schema
export const rejectDirectExpenseSchema = z.object({
  rejectionReason: z.string().min(1, "Rejection reason is required"),
});

// Mark as Paid Schema
export const markDirectExpenseAsPaidSchema = z.object({
  paymentProofUrl: z.string().url("Invalid payment proof URL"),
  paymentDate: z.date().or(z.string()).optional(),
  paymentNotes: z.string().optional(),
});

// Get Direct Expenses Query Schema
export const getDirectExpensesSchema = z.object({
  status: z.nativeEnum(DirectExpenseStatus).optional(),
  projectId: z.string().optional(),
  categoryId: z.string().optional(),
  createdById: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  startDate: z.date().or(z.string()).optional(),
  endDate: z.date().or(z.string()).optional(),
});

// Types
export type CreateDirectExpenseInput = z.infer<typeof createDirectExpenseSchema>;
export type ApproveDirectExpenseInput = z.infer<typeof approveDirectExpenseSchema>;
export type RejectDirectExpenseInput = z.infer<typeof rejectDirectExpenseSchema>;
export type MarkDirectExpenseAsPaidInput = z.infer<typeof markDirectExpenseAsPaidSchema>;
export type GetDirectExpensesInput = z.infer<typeof getDirectExpensesSchema>;
