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

// Create Reimbursement Schema
export const CreateReimbursementSchema = z.object({
  expenseId: z.string().cuid("Invalid expense ID"),
});

export type CreateReimbursementInput = z.infer<typeof CreateReimbursementSchema>;

// Approve Reimbursement Schema
export const ApproveReimbursementSchema = z.object({
  reimbursementId: z.string().cuid("Invalid reimbursement ID"),
});

export type ApproveReimbursementInput = z.infer<typeof ApproveReimbursementSchema>;

// Reject Reimbursement Schema
export const RejectReimbursementSchema = z.object({
  reimbursementId: z.string().cuid("Invalid reimbursement ID"),
  rejectionReason: z.string().min(10, "Rejection reason must be at least 10 characters"),
});

export type RejectReimbursementInput = z.infer<typeof RejectReimbursementSchema>;

// Pay Reimbursement Schema
export const PayReimbursementSchema = z.object({
  reimbursementId: z.string().cuid("Invalid reimbursement ID"),
  paymentProofUrl: z.string().url("Invalid payment proof URL").optional(),
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
  search: z.string().optional(),
  fromDate: z.date().or(z.string().datetime()).optional(),
  toDate: z.date().or(z.string().datetime()).optional(),
  projectId: z.string().cuid().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.enum(["submittedAt", "approvedAt", "paidAt", "createdAt"]).default("submittedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ReimbursementFilter = z.infer<typeof ReimbursementFilterSchema>;

// Bulk Approve Reimbursement Schema
export const BulkApproveReimbursementSchema = z.object({
  reimbursementIds: z.array(z.string().cuid()).min(1, "At least one reimbursement ID is required"),
});

export type BulkApproveReimbursementInput = z.infer<typeof BulkApproveReimbursementSchema>;

// Bulk Pay Reimbursement Schema
export const BulkPayReimbursementSchema = z.object({
  reimbursementIds: z.array(z.string().cuid()).min(1, "At least one reimbursement ID is required"),
  paymentProofUrl: z.string().url("Invalid payment proof URL").optional(),
});

export type BulkPayReimbursementInput = z.infer<typeof BulkPayReimbursementSchema>;
