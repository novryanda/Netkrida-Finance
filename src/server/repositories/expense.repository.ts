/**
 * Expense Repository
 * Handle database operations untuk Expense (Final Recording)
 */

import { db } from "../db";
import { ExpenseSourceType } from "../schema/enums";
import type { GetExpensesInput } from "../schema/expense.schema";

export class ExpenseRepository {
  /**
   * Get all expenses with filters
   */
  async findMany(filters: GetExpensesInput) {
    const {
      projectId,
      categoryId,
      sourceType,
      startDate,
      endDate,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (projectId) where.projectId = projectId;
    if (categoryId) where.categoryId = categoryId;
    if (sourceType) where.sourceType = sourceType;

    if (search) {
      where.description = { contains: search, mode: "insensitive" };
    }

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = new Date(startDate);
      if (endDate) where.expenseDate.lte = new Date(endDate);
    }

    const [expenses, total] = await Promise.all([
      db.expense.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              projectName: true,
              clientName: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          recordedBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.expense.count({ where }),
    ]);

    return {
      expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get expense by ID
   */
  async findById(id: string) {
    return await db.expense.findUnique({
      where: { id },
      include: {
        project: true,
        category: true,
        recordedBy: {
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
   * Get expense summary by project
   */
  async getSummaryByProject(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = startDate;
      if (endDate) where.expenseDate.lte = endDate;
    }

    const summary = await db.expense.groupBy({
      by: ["projectId"],
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get project details
    const projectIds = summary
      .map((s) => s.projectId)
      .filter((id): id is string => id !== null);

    const projects = await db.project.findMany({
      where: { id: { in: projectIds } },
      select: {
        id: true,
        projectName: true,
        clientName: true,
        projectValue: true,
      },
    });

    return summary.map((s) => {
      const project = projects.find((p) => p.id === s.projectId);
      return {
        projectId: s.projectId,
        projectName: project?.projectName,
        clientName: project?.clientName,
        projectValue: project?.projectValue,
        totalExpense: s._sum.amount,
        totalCount: s._count.id,
      };
    });
  }

  /**
   * Get expense summary by category
   */
  async getSummaryByCategory(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = startDate;
      if (endDate) where.expenseDate.lte = endDate;
    }

    const summary = await db.expense.groupBy({
      by: ["categoryId"],
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get category details
    const categoryIds = summary.map((s) => s.categoryId);

    const categories = await db.expenseCategory.findMany({
      where: { id: { in: categoryIds } },
      select: {
        id: true,
        name: true,
      },
    });

    return summary.map((s) => {
      const category = categories.find((c) => c.id === s.categoryId);
      return {
        categoryId: s.categoryId,
        categoryName: category?.name,
        totalExpense: s._sum.amount,
        totalCount: s._count.id,
      };
    });
  }

  /**
   * Get expense summary by source type
   */
  async getSummaryBySourceType(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = startDate;
      if (endDate) where.expenseDate.lte = endDate;
    }

    return await db.expense.groupBy({
      by: ["sourceType"],
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });
  }

  /**
   * Get expense summary by month
   */
  async getSummaryByMonth(startDate: Date, endDate: Date) {
    const expenses = await db.expense.findMany({
      where: {
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        expenseDate: true,
        amount: true,
      },
    });

    // Group by month manually
    const monthlyData = expenses.reduce((acc: any, expense) => {
      const monthKey = new Date(expense.expenseDate)
        .toISOString()
        .substring(0, 7); // YYYY-MM

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          totalExpense: 0,
          totalCount: 0,
        };
      }

      acc[monthKey].totalExpense += Number(expense.amount);
      acc[monthKey].totalCount += 1;

      return acc;
    }, {});

    return Object.values(monthlyData);
  }

  /**
   * Get total expenses
   */
  async getTotalExpenses(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = startDate;
      if (endDate) where.expenseDate.lte = endDate;
    }

    const result = await db.expense.aggregate({
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      totalAmount: result._sum.amount || 0,
      totalCount: result._count.id || 0,
    };
  }
}

export const expenseRepository = new ExpenseRepository();
