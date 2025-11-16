/**
 * Settings Repository
 * Menangani operasi database untuk settings user
 */

import { db } from "@/server/db";
import type { UpdateProfileInput } from "@/server/schema/settings.schema";

export class SettingsRepository {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string) {
    return await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bankName: true,
        bankAccountNo: true,
        image: true,
        imagePublicId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Get user with password for password verification
   */
  async getUserWithPassword(userId: string) {
    return await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });
  }

  /**
   * Update user profile (tidak termasuk role dan email)
   */
  async updateProfile(userId: string, data: UpdateProfileInput) {
    return await db.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.bankName !== undefined && { bankName: data.bankName }),
        ...(data.bankAccountNo !== undefined && {
          bankAccountNo: data.bankAccountNo,
        }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.imagePublicId !== undefined && { imagePublicId: data.imagePublicId }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bankName: true,
        bankAccountNo: true,
        image: true,
        imagePublicId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, hashedPassword: string) {
    return await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  /**
   * Update profile picture
   */
  async updateProfilePicture(userId: string, imageUrl: string, imagePublicId: string) {
    return await db.user.update({
      where: { id: userId },
      data: { image: imageUrl, imagePublicId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        imagePublicId: true,
      },
    });
  }
}

export const settingsRepository = new SettingsRepository();
