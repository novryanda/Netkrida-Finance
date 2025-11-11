/**
 * Common Schema
 * Definisi tipe data umum yang digunakan di seluruh aplikasi
 */

import { z } from "zod";

// Pagination Schema
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

// Paginated Response Schema
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    data: z.array(dataSchema),
    pagination: PaginationSchema,
  });
}

export type PaginatedResponse<T> = {
  data: T[];
  pagination: Pagination;
};

// API Response Schema
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};

// Error Response Schema
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.any().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Success Response Schema
export function createSuccessResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    message: z.string().optional(),
    data: dataSchema,
  });
}

export type SuccessResponse<T> = {
  success: true;
  message?: string;
  data: T;
};

// Sort Schema
export const SortSchema = z.object({
  sortBy: z.string(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type Sort = z.infer<typeof SortSchema>;

// Date Range Schema
export const DateRangeSchema = z.object({
  fromDate: z.date().or(z.string().datetime()).optional(),
  toDate: z.date().or(z.string().datetime()).optional(),
});

export type DateRange = z.infer<typeof DateRangeSchema>;

// ID Schema
export const IdSchema = z.object({
  id: z.string().cuid("Invalid ID format"),
});

export type IdParam = z.infer<typeof IdSchema>;

// Search Schema
export const SearchSchema = z.object({
  search: z.string().optional(),
});

export type Search = z.infer<typeof SearchSchema>;

// File Upload Schema
export const FileUploadSchema = z.object({
  filename: z.string(),
  mimetype: z.string(),
  size: z.number().positive(),
  url: z.string().url(),
});

export type FileUpload = z.infer<typeof FileUploadSchema>;

// Bulk Action Schema
export const BulkActionSchema = z.object({
  ids: z.array(z.string().cuid()).min(1, "At least one ID is required"),
});

export type BulkAction = z.infer<typeof BulkActionSchema>;

// Query Params Schema (gabungan pagination, sort, search)
export const QueryParamsSchema = PaginationSchema.merge(SortSchema).merge(SearchSchema);

export type QueryParams = z.infer<typeof QueryParamsSchema>;
