/**
 * Settings Service
 * Business logic untuk settings user
 */

import bcrypt from "bcryptjs";
import { settingsRepository } from "@/server/repositories/settings.repository";
import type {
  UpdateProfileInput,
  ChangePasswordInput,
} from "@/server/schema/settings.schema";

export class SettingsService {
  /**
   * Get user profile
   */
  async getUserProfile(userId: string) {
    const user = await settingsRepository.getUserProfile(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileInput) {
    // Validasi user exists
    const existingUser = await settingsRepository.getUserProfile(userId);
    if (!existingUser) {
      throw new Error("User not found");
    }

    // Update profile
    const updatedUser = await settingsRepository.updateProfile(userId, data);

    return {
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    };
  }

  /**
   * Change password
   */
  async changePassword(userId: string, data: ChangePasswordInput) {
    // Get user dengan password
    const user = await settingsRepository.getUserWithPassword(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.password) {
      throw new Error(
        "Cannot change password for users without password authentication"
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      data.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Update password
    await settingsRepository.updatePassword(userId, hashedPassword);

    return {
      success: true,
      message: "Password changed successfully",
    };
  }

  /**
   * Update profile picture
   */
  async updateProfilePicture(userId: string, imageUrl: string, imagePublicId: string) {
    // Validasi user exists
    const existingUser = await settingsRepository.getUserProfile(userId);
    if (!existingUser) {
      throw new Error("User not found");
    }
  
    // Update profile picture
    const updatedUser = await settingsRepository.updateProfilePicture(
      userId,
      imageUrl,
      imagePublicId
    );
  
    return {
      success: true,
      message: "Profile picture updated successfully",
      data: updatedUser,
    };
  }
}

export const settingsService = new SettingsService();
