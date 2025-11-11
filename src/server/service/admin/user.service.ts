/**
 * Admin User Service
 * Business logic untuk admin mengelola users
 */

import { userRepository } from "@/server/repositories/user.repository";
import type { CreateUserInput, UpdateUserInput } from "@/server/schema";
import bcrypt from "bcryptjs";

export class AdminUserService {
  /**
   * Get all users
   */
  async getAllUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    return await userRepository.findAll(params);
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserInput) {
    // Check if email already exists
    const emailExists = await userRepository.emailExists(data.email);
    if (emailExists) {
      throw new Error("Email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await userRepository.create({
      ...data,
      password: hashedPassword,
    });

    return user;
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserInput) {
    // Check if user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    // Check if email already exists (excluding current user)
    if (data.email) {
      const emailExists = await userRepository.emailExists(data.email, id);
      if (emailExists) {
        throw new Error("Email already exists");
      }
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    // Update user
    const user = await userRepository.update(id, {
      ...data,
      ...(hashedPassword && { password: hashedPassword }),
    });

    return user;
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(id: string) {
    // Check if user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    // Soft delete
    return await userRepository.softDelete(id);
  }

  /**
   * Hard delete user
   */
  async hardDeleteUser(id: string) {
    // Check if user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    // Hard delete
    return await userRepository.delete(id);
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    return await userRepository.update(id, {
      isActive: !user.isActive,
    });
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    return await userRepository.getStats();
  }
}

export const adminUserService = new AdminUserService();
