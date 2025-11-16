/**
 * Reimbursement Schema
 * Definisi tipe data dan validasi untuk Reimbursement
 */

import { z } from "zod";
import { ReimbursementStatus } from "./enums";

// Base Reimbursement Schema
export const ReimbursementSchema = z.object({
  id: z.string().cuid(),
  expenseId: z.string(),
  status: z.nativeEnum(ReimbursementStatus),
  submittedAt: z.date(),
  submittedById: z.string(),
  approvedAt: z.date().nullable(),
  approvedById: z.string().nullable(),
  paidAt: z.date().nullable(),
  paidById: z.string().nullable(),
  paymentProofUrl: z.string().url().nullable(),
  rejectionReason: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Reimbursement = z.infer<typeof ReimbursementSchema>;

// Create Reimbursement Schema (Submit by STAFF)
export const CreateReimbursementSchema = z.object({
  projectId: z.string().cuid("Invalid project ID"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  expenseDate: z.date().or(z.string()),
  receiptUrl: z.string().url("Invalid receipt URL"),
});

export type CreateReimbursementInput = z.infer<typeof CreateReimbursementSchema>;

// Review Reimbursement Schema (FINANCE)
export const ReviewReimbursementSchema = z.object({
  reviewNotes: z.string().optional(),
});

export type ReviewReimbursementInput = z.infer<typeof ReviewReimbursementSchema>;

// Approve Reimbursement Schema (ADMIN)
export const ApproveReimbursementSchema = z.object({
  approvalNotes: z.string().optional(),
});

export type ApproveReimbursementInput = z.infer<typeof ApproveReimbursementSchema>;

// Reject Reimbursement Schema
export const RejectReimbursementSchema = z.object({
  rejectionReason: z.string().min(10, "Rejection reason must be at least 10 characters"),
});

export type RejectReimbursementInput = z.infer<typeof RejectReimbursementSchema>;

// Pay Reimbursement Schema (FINANCE)
export const PayReimbursementSchema = z.object({
  paymentProofUrl: z.string().url("Invalid payment proof URL"),
  paymentDate: z.date().or(z.string()).optional(),
  paymentNotes: z.string().optional(),
});

export type PayReimbursementInput = z.infer<typeof PayReimbursementSchema>;

// Reimbursement dengan relasi
export const ReimbursementWithRelationsSchema = ReimbursementSchema.extend({
  expense: z.any().optional(),
  submittedBy: z.any().optional(),
  approvedBy: z.any().optional(),
  paidBy: z.any().optional(),
});

export type ReimbursementWithRelations = z.infer<typeof ReimbursementWithRelationsSchema>;

// Reimbursement Filter Schema
export const ReimbursementFilterSchema = z.object({
  status: z.nativeEnum(ReimbursementStatus).optional(),
  submittedById: z.string().cuid().optional(),
  reviewedById: z.string().cuid().optional(),
  projectId: z.string().cuid().optional(),
  search: z.string().optional(),
  fromDate: z.date().or(z.string().datetime()).optional(),
  toDate: z.date().or(z.string().datetime()).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.enum(["submittedAt", "reviewedAt", "approvedAt", "paidAt", "createdAt"]).default("submittedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ReimbursementFilter = z.infer<typeof ReimbursementFilterSchema>;
