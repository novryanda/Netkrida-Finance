/**
 * Project Schema
 * Definisi tipe data dan validasi untuk Project
 */

import { z } from "zod";
import { ProjectStatus } from "./enums";

// Base Project Schema
export const ProjectSchema = z.object({
  id: z.string().cuid(),
  projectName: z.string(),
  clientName: z.string(),
  projectValue: z.number().or(z.string()),
  deadline: z.date(),
  status: z.nativeEnum(ProjectStatus),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdById: z.string(),
});

export type Project = z.infer<typeof ProjectSchema>;

// Create Project Schema
export const CreateProjectSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  clientName: z.string().min(1, "Client name is required"),
  projectValue: z
    .number()
    .positive("Project value must be positive")
    .or(z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid project value")),
  deadline: z.date().or(z.string().datetime()),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.ACTIVE),
  description: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

// Update Project Schema
export const UpdateProjectSchema = z.object({
  projectName: z.string().min(1, "Project name is required").optional(),
  clientName: z.string().min(1, "Client name is required").optional(),
  projectValue: z
    .number()
    .positive("Project value must be positive")
    .or(z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid project value"))
    .optional(),
  deadline: z.date().or(z.string().datetime()).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  description: z.string().optional(),
});

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

// Project Revision Schema
export const ProjectRevisionSchema = z.object({
  id: z.string().cuid(),
  projectId: z.string(),
  oldValue: z.number().or(z.string()),
  newValue: z.number().or(z.string()),
  reason: z.string(),
  changedAt: z.date(),
  changedById: z.string(),
});

export type ProjectRevision = z.infer<typeof ProjectRevisionSchema>;

// Create Project Revision Schema
export const CreateProjectRevisionSchema = z.object({
  projectId: z.string().cuid(),
  oldValue: z.number().or(z.string()),
  newValue: z.number().positive("New value must be positive").or(z.string()),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

export type CreateProjectRevisionInput = z.infer<typeof CreateProjectRevisionSchema>;

// Project dengan relasi
export const ProjectWithRelationsSchema = ProjectSchema.extend({
  createdBy: z.any().optional(),
  expenses: z.array(z.any()).optional(),
  projectRevisions: z.array(ProjectRevisionSchema).optional(),
  _count: z
    .object({
      expenses: z.number(),
      projectRevisions: z.number(),
    })
    .optional(),
});

export type ProjectWithRelations = z.infer<typeof ProjectWithRelationsSchema>;

// Project Filter Schema (untuk query parameters)
export const ProjectFilterSchema = z.object({
  status: z.nativeEnum(ProjectStatus).optional(),
  clientName: z.string().optional(),
  search: z.string().optional(),
  fromDate: z.date().or(z.string().datetime()).optional(),
  toDate: z.date().or(z.string().datetime()).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.enum(["projectName", "clientName", "deadline", "projectValue", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ProjectFilter = z.infer<typeof ProjectFilterSchema>;
