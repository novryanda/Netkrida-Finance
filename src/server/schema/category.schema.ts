/**
 * Category Schema
 * Validasi untuk Expense Category
 */

import { z } from "zod";

// Create Category Schema
export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Update Category Schema
export const updateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100).optional(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

// Get Categories Query Schema
export const getCategoriesSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Types
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type GetCategoriesInput = z.infer<typeof getCategoriesSchema>;
