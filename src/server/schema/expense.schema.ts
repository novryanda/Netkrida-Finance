/**
 * Expense Schema
 * Definisi tipe data dan validasi untuk Expense
 */

import { z } from "zod";
import { ExpenseSourceType } from "./enums";

// Get Expenses Query Schema
export const getExpensesSchema = z.object({
  projectId: z.string().optional(),
  categoryId: z.string().optional(),
  sourceType: z.nativeEnum(ExpenseSourceType).optional(),
  startDate: z.date().or(z.string()).optional(),
  endDate: z.date().or(z.string()).optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(["expenseDate", "amount", "recordedAt"]).default("expenseDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type GetExpensesInput = z.infer<typeof getExpensesSchema>;

// Expense Report Schema
export const expenseReportSchema = z.object({
  projectId: z.string().optional(),
  categoryId: z.string().optional(),
  startDate: z.date().or(z.string()),
  endDate: z.date().or(z.string()),
  groupBy: z.enum(["project", "category", "sourceType", "month"]).default("category"),
});

export type ExpenseReportInput = z.infer<typeof expenseReportSchema>;
