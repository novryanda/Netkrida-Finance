/**
 * Category Repository
 * Handle database operations untuk ExpenseCategory
 */

import { db } from "../db";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  GetCategoriesInput,
} from "../schema/category.schema";

export class CategoryRepository {
  /**
   * Create new category
   */
  async create(data: CreateCategoryInput, createdById: string) {
    return await db.expenseCategory.create({
      data: {
        ...data,
        createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Get category by ID
   */
  async findById(id: string) {
    return await db.expenseCategory.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            expenses: true,
            directExpenses: true,
          },
        },
      },
    });
  }

  /**
   * Get category by name
   */
  async findByName(name: string) {
    return await db.expenseCategory.findUnique({
      where: { name },
    });
  }

  /**
   * Get all categories with filters
   */
  async findMany(filters: GetCategoriesInput) {
    const { isActive, search, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (typeof isActive === "boolean") {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [categories, total] = await Promise.all([
      db.expenseCategory.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          _count: {
            select: {
              expenses: true,
              directExpenses: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.expenseCategory.count({ where }),
    ]);

    // Calculate total amount per category
    const categoriesWithTotal = await Promise.all(
      categories.map(async (category) => {
        const totalExpenses = await db.expense.aggregate({
          where: { categoryId: category.id },
          _sum: { amount: true },
        });
        
        const totalDirectExpenses = await db.directExpenseRequest.aggregate({
          where: { 
            categoryId: category.id,
            status: "PAID",
          },
          _sum: { amount: true },
        });

        return {
          ...category,
          totalAmount: 
            (totalExpenses._sum.amount?.toNumber() || 0) +
            (totalDirectExpenses._sum.amount?.toNumber() || 0),
        };
      })
    );

    return {
      categories: categoriesWithTotal,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all active categories (for dropdowns)
   */
  async findAllActive() {
    return await db.expenseCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
  }

  /**
   * Update category
   */
  async update(id: string, data: UpdateCategoryInput) {
    return await db.expenseCategory.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Delete category (soft delete by setting isActive = false)
   */
  async deactivate(id: string) {
    return await db.expenseCategory.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Check if category is in use
   */
  async isInUse(id: string): Promise<boolean> {
    const [expenseCount, directExpenseCount] = await Promise.all([
      db.expense.count({ where: { categoryId: id } }),
      db.directExpenseRequest.count({ where: { categoryId: id } }),
    ]);

    return expenseCount > 0 || directExpenseCount > 0;
  }
}

export const categoryRepository = new CategoryRepository();
