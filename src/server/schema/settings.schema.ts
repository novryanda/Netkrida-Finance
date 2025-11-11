/**
 * Settings Schema
 * Schema untuk update profile user
 */

import { z } from "zod";

// Update Profile Schema (tidak termasuk role dan email)
export const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  bankName: z.string().optional().nullable(),
  bankAccountNo: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// Change Password Schema
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

// Upload Profile Picture Response
export const UploadProfilePictureResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  imageUrl: z.string().optional(),
});

export type UploadProfilePictureResponse = z.infer<
  typeof UploadProfilePictureResponseSchema
>;
