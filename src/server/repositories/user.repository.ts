/**
 * User Repository
 * Menangani semua operasi database untuk User
 */

import { db } from "@/server/db";
// @ts-ignore
import type { UserWhereInput } from "../../generated/prisma/index";
import type { CreateUserInput, UpdateUserInput } from "@/server/schema";

// @ts-ignore
import type { UserWhereInput } from "../../generated/prisma/index";

export class UserRepository {
  /**
   * Get all users dengan pagination dan filter
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: UserWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { bankName: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(role && { role: role as any }),
      ...(isActive !== undefined && { isActive }),
    };

    // Get total count
    const total = await db.user.count({ where });

    // Get users
    const users = await db.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bankName: true,
        bankAccountNo: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        image: true,
        emailVerified: true,
        // Exclude password
      },
    });

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user by ID
   */
  async findById(id: string) {
    return await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bankName: true,
        bankAccountNo: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        image: true,
        emailVerified: true,
        // Exclude password
      },
    });
  }

  /**
   * Get user by ID with password (untuk authentication)
   */
  async findByIdWithPassword(id: string) {
    return await db.user.findUnique({
      where: { id },
    });
  }

  /**
   * Get user by email
   */
  async findByEmail(email: string) {
    return await db.user.findUnique({
      where: { email },
    });
  }

  /**
   * Get user by email with password
   */
  async findByEmailWithPassword(email: string) {
    return await db.user.findUnique({
      where: { email },
    });
  }

  /**
   * Create new user
   */
  async create(data: CreateUserInput & { password: string }) {
    return await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        bankName: data.bankName,
        bankAccountNo: data.bankAccountNo,
        isActive: data.isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bankName: true,
        bankAccountNo: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        image: true,
        emailVerified: true,
      },
    });
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserInput & { password?: string }) {
    return await db.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.password && { password: data.password }),
        ...(data.role && { role: data.role }),
        ...(data.bankName !== undefined && { bankName: data.bankName }),
        ...(data.bankAccountNo !== undefined && {
          bankAccountNo: data.bankAccountNo,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bankName: true,
        bankAccountNo: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        image: true,
        emailVerified: true,
      },
    });
  }

  /**
   * Delete user (soft delete by setting isActive = false)
   */
  async softDelete(id: string) {
    return await db.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });
  }

  /**
   * Delete user (hard delete)
   */
  async delete(id: string) {
    return await db.user.delete({
      where: { id },
    });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeUserId?: string) {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) return false;
    if (excludeUserId && user.id === excludeUserId) return false;

    return true;
  }

  /**
   * Get user statistics
   */
  async getStats() {
    const [total, activeUsers, inactiveUsers, byRole] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.user.count({ where: { isActive: false } }),
      db.user.groupBy({
        by: ["role"],
        _count: true,
      }),
    ]);

    return {
      total,
      active: activeUsers,
      inactive: inactiveUsers,
      byRole: byRole.map((r) => ({
        role: r.role,
        count: r._count,
      })),
    };
  }
}

export const userRepository = new UserRepository();
