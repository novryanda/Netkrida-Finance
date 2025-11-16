/**
 * User Schema
 * Definisi tipe data dan validasi untuk User
 */

import { z } from "zod";
import { UserRole } from "./enums";

// Base User Schema
export const UserSchema = z.object({
  id: z.string().cuid(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  emailVerified: z.date().nullable(),
  image: z.string().url().nullable(),
  imagePublicId: z.string().nullable(),
  password: z.string().nullable(),
  role: z.nativeEnum(UserRole),
  bankName: z.string().nullable(),
  bankAccountNo: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// Create User Schema (untuk registrasi/create)
export const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.nativeEnum(UserRole).default(UserRole.STAFF),
  bankName: z.string().optional(),
  bankAccountNo: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

// Update User Schema
export const UpdateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  role: z.nativeEnum(UserRole).optional(),
  bankName: z.string().optional(),
  bankAccountNo: z.string().optional(),
  isActive: z.boolean().optional(),
  imagePublicId: z.string().optional().nullable(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// Login Schema
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// User dengan relasi (untuk response yang kompleks)
export const UserWithRelationsSchema = UserSchema.extend({
  createdProjects: z.array(z.any()).optional(),
  createdExpenses: z.array(z.any()).optional(),
  submittedReimburse: z.array(z.any()).optional(),
  approvedReimburse: z.array(z.any()).optional(),
  paidReimburse: z.array(z.any()).optional(),
});

export type UserWithRelations = z.infer<typeof UserWithRelationsSchema>;

// User untuk response (tanpa password)
export const UserResponseSchema = UserSchema.omit({ password: true });

export type UserResponse = z.infer<typeof UserResponseSchema>;
