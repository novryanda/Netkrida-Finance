/**
 * Expense Schema
 * Definisi tipe data dan validasi untuk Expense
 */

import { z } from "zod";
import { ExpenseType } from "./enums";

// Base Expense Schema
export const ExpenseSchema = z.object({
  id: z.string().cuid(),
  projectId: z.string(),
  expenseType: z.nativeEnum(ExpenseType),
  description: z.string(),
  amount: z.number().or(z.string()),
  expenseDate: z.date(),
  receiptUrl: z.string().url().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdById: z.string(),
});

export type Expense = z.infer<typeof ExpenseSchema>;

// Create Expense Schema
export const CreateExpenseSchema = z.object({
  projectId: z.string().cuid("Invalid project ID"),
  expenseType: z.nativeEnum(ExpenseType),
  description: z.string().min(10, "Description must be at least 10 characters"),
  amount: z
    .number()
    .positive("Amount must be positive")
    .or(z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount")),
  expenseDate: z.date().or(z.string().datetime()),
  receiptUrl: z.string().url("Invalid receipt URL").optional(),
});

export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;

// Update Expense Schema
export const UpdateExpenseSchema = z.object({
  projectId: z.string().cuid("Invalid project ID").optional(),
  expenseType: z.nativeEnum(ExpenseType).optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  amount: z
    .number()
    .positive("Amount must be positive")
    .or(z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"))
    .optional(),
  expenseDate: z.date().or(z.string().datetime()).optional(),
  receiptUrl: z.string().url("Invalid receipt URL").optional(),
});

export type UpdateExpenseInput = z.infer<typeof UpdateExpenseSchema>;

// Expense dengan relasi
export const ExpenseWithRelationsSchema = ExpenseSchema.extend({
  project: z.any().optional(),
  createdBy: z.any().optional(),
  reimbursement: z.any().optional(),
});

export type ExpenseWithRelations = z.infer<typeof ExpenseWithRelationsSchema>;

// Expense Filter Schema
export const ExpenseFilterSchema = z.object({
  projectId: z.string().cuid().optional(),
  expenseType: z.nativeEnum(ExpenseType).optional(),
  search: z.string().optional(),
  fromDate: z.date().or(z.string().datetime()).optional(),
  toDate: z.date().or(z.string().datetime()).optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.enum(["expenseDate", "amount", "createdAt"]).default("expenseDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ExpenseFilter = z.infer<typeof ExpenseFilterSchema>;

// Upload Receipt Schema
export const UploadReceiptSchema = z.object({
  expenseId: z.string().cuid(),
  receiptUrl: z.string().url("Invalid receipt URL"),
});

export type UploadReceiptInput = z.infer<typeof UploadReceiptSchema>;
