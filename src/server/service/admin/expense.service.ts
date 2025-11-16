/**
 * Expense Service
 * Business logic untuk Expense Reporting & Analytics
 */

import { expenseRepository } from "../../repositories/expense.repository";
import type {
  GetExpensesInput,
  ExpenseReportInput,
} from "../../schema/expense.schema";

export class ExpenseService {
  /**
   * Get all expenses with filters
   * @access ADMIN, FINANCE
   */
  async getExpenses(filters: GetExpensesInput) {
    return await expenseRepository.findMany(filters);
  }

  /**
   * Get expense by ID
   * @access ADMIN, FINANCE
   */
  async getExpenseById(id: string) {
    const expense = await expenseRepository.findById(id);
    if (!expense) {
      throw new Error("Expense not found");
    }
    return expense;
  }

  /**
   * Get expense report
   * @access ADMIN, FINANCE
   */
  async getExpenseReport(params: ExpenseReportInput) {
    const { projectId, categoryId, startDate, endDate, groupBy } = params;

    const start = new Date(startDate);
    const end = new Date(endDate);

    let summary;

    switch (groupBy) {
      case "project":
        summary = await expenseRepository.getSummaryByProject(start, end);
        break;
      case "category":
        summary = await expenseRepository.getSummaryByCategory(start, end);
        break;
      case "sourceType":
        summary = await expenseRepository.getSummaryBySourceType(start, end);
        break;
      case "month":
        summary = await expenseRepository.getSummaryByMonth(start, end);
        break;
      default:
        summary = await expenseRepository.getSummaryByCategory(start, end);
    }

    // Get total
    const total = await expenseRepository.getTotalExpenses(start, end);

    return {
      summary,
      total,
      filters: {
        startDate: start,
        endDate: end,
        groupBy,
      },
    };
  }

  /**
   * Get dashboard statistics
   * @access ALL
   */
  async getDashboardStatistics(userId?: string, role?: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [thisMonth, lastMonth, allTime] = await Promise.all([
      expenseRepository.getTotalExpenses(startOfMonth, endOfMonth),
      expenseRepository.getTotalExpenses(
        new Date(now.getFullYear(), now.getMonth() - 1, 1),
        new Date(now.getFullYear(), now.getMonth(), 0)
      ),
      expenseRepository.getTotalExpenses(),
    ]);

    // Get by category (top 5)
    const byCategory = await expenseRepository.getSummaryByCategory(
      startOfMonth,
      endOfMonth
    );

    // Get by source type
    const bySourceType = await expenseRepository.getSummaryBySourceType(
      startOfMonth,
      endOfMonth
    );

    return {
      thisMonth,
      lastMonth,
      allTime,
      topCategories: byCategory.slice(0, 5),
      bySourceType,
    };
  }

  /**
   * Get project expense summary
   * @access ADMIN, FINANCE
   */
  async getProjectExpenseSummary(
    projectId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const filters: GetExpensesInput = {
      projectId,
      page: 1,
      limit: 1000, // Get all for summary
      sortBy: "expenseDate",
      sortOrder: "desc",
    };

    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const { expenses } = await expenseRepository.findMany(filters);

    // Group by category
    const byCategory = expenses.reduce((acc: any, expense) => {
      const categoryName = expense.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = {
          categoryName,
          totalAmount: 0,
          count: 0,
        };
      }
      acc[categoryName].totalAmount += Number(expense.amount);
      acc[categoryName].count += 1;
      return acc;
    }, {});

    const totalAmount = expenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0
    );

    return {
      projectId,
      totalAmount,
      totalCount: expenses.length,
      byCategory: Object.values(byCategory),
      expenses: expenses.slice(0, 10), // Latest 10
    };
  }
}

export const expenseService = new ExpenseService();
