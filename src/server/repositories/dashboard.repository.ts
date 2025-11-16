import { db } from "@/server/db";
import {
  ReimbursementStatus,
  DirectExpenseStatus,
  ProjectStatus,
  UserRole
} from "@prisma/client";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear
} from "date-fns";

export class DashboardRepository {
  // ============================================
  // ADMIN DASHBOARD QUERIES
  // ============================================

  async getAdminOverview() {
    const now = new Date();
    const startMonth = startOfMonth(now);
    const endMonth = endOfMonth(now);
    const startYear = startOfYear(now);
    // Bulan lalu
    const prevMonth = new Date(startMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const startPrevMonth = startOfMonth(prevMonth);
    const endPrevMonth = endOfMonth(prevMonth);

    const [
      totalProjects,
      activeProjects,
      totalUsers,
      pendingReimbursements,
      pendingDirectExpenses,
      totalExpensesThisMonth,
      totalExpensesPrevMonth,
      totalExpensesThisYear,
      totalProjectsPrev,
    ] = await Promise.all([
      db.project.count(),
      db.project.count({ where: { status: ProjectStatus.ACTIVE } }),
      db.user.count({ where: { isActive: true } }),
      db.reimbursement.count({ where: { status: ReimbursementStatus.PENDING } }),
      db.directExpenseRequest.count({ where: { status: DirectExpenseStatus.PENDING } }),
      db.expense.aggregate({
        where: {
          expenseDate: {
            gte: startMonth,
            lte: endMonth,
          },
        },
        _sum: { amount: true },
      }),
      db.expense.aggregate({
        where: {
          expenseDate: {
            gte: startPrevMonth,
            lte: endPrevMonth,
          },
        },
        _sum: { amount: true },
      }),
      db.expense.aggregate({
        where: {
          expenseDate: {
            gte: startYear,
            lte: now,
          },
        },
        _sum: { amount: true },
      }),
      db.project.count({
        where: {
          createdAt: {
            gte: startPrevMonth,
            lte: endPrevMonth,
          },
        },
      }),
    ]);

    const thisMonth = totalExpensesThisMonth._sum.amount?.toNumber() || 0;
    const prevMonthVal = totalExpensesPrevMonth._sum.amount?.toNumber() || 0;
    const growth = prevMonthVal === 0 ? null : ((thisMonth - prevMonthVal) / prevMonthVal) * 100;

    return {
      totalProjects,
      activeProjects,
      totalUsers,
      pendingReimbursements,
      pendingDirectExpenses,
      totalExpensesThisMonth: thisMonth,
      totalExpensesPrevMonth: prevMonthVal,
      totalExpensesGrowth: growth,
      totalExpensesThisYear: totalExpensesThisYear._sum.amount?.toNumber() || 0,
      totalProjectsPrev,
    };
  }

  async getMonthlyExpensesTrend(months: number = 6) {
    const now = new Date();
    const monthsData = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const startMonth = startOfMonth(monthDate);
      const endMonth = endOfMonth(monthDate);

      const expenses = await db.expense.aggregate({
        where: {
          expenseDate: {
            gte: startMonth,
            lte: endMonth,
          },
        },
        _sum: { amount: true },
      });

      monthsData.push({
        month: monthDate.toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
        amount: expenses._sum.amount?.toNumber() || 0,
      });
    }

    return monthsData;
  }

  async getIncomeExpenseTrend(months: number = 6) {
    const now = new Date();
    const monthsData = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const startMonth = startOfMonth(monthDate);
      const endMonth = endOfMonth(monthDate);

      // Total pemasukan: sum projectValue dari project yang dibuat di bulan tsb
      const income = await db.project.aggregate({
        where: {
          createdAt: {
            gte: startMonth,
            lte: endMonth,
          },
        },
        _sum: { projectValue: true },
      });

      // Total pengeluaran: sum amount dari expense di bulan tsb
      const expense = await db.expense.aggregate({
        where: {
          expenseDate: {
            gte: startMonth,
            lte: endMonth,
          },
        },
        _sum: { amount: true },
      });

      monthsData.push({
        month: monthDate.toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
        income: income._sum.projectValue?.toNumber() || 0,
        expense: expense._sum.amount?.toNumber() || 0,
      });
    }
    return monthsData;
  }

  async getExpensesByCategory() {
    const categories = await db.expenseCategory.findMany({
      where: { isActive: true },
      include: {
        expenses: {
          select: {
            amount: true,
          },
        },
      },
    });

    return categories.map((category) => ({
      name: category.name,
      total: category.expenses.reduce(
        (sum, expense) => sum + expense.amount.toNumber(),
        0
      ),
    }));
  }

  async getProjectStatusDistribution() {
    const projects = await db.project.groupBy({
      by: ["status"],
      _count: true,
    });

    return projects.map((p) => ({
      status: p.status,
      count: p._count,
    }));
  }

  async getTopExpenseProjects(limit: number = 5) {
    const projects = await db.project.findMany({
      include: {
        expenses: {
          select: {
            amount: true,
          },
        },
      },
      take: limit,
    });

    const projectsWithTotal = projects.map((project) => ({
      id: project.id,
      name: project.projectName,
      client: project.clientName,
      totalExpenses: project.expenses.reduce(
        (sum, expense) => sum + expense.amount.toNumber(),
        0
      ),
      projectValue: project.projectValue.toNumber(),
    }));

    return projectsWithTotal.sort((a, b) => b.totalExpenses - a.totalExpenses).slice(0, limit);
  }

  async getRecentActivities(limit: number = 10) {
    const [reimbursements, directExpenses] = await Promise.all([
      db.reimbursement.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          submittedBy: {
            select: { name: true, email: true },
          },
          project: {
            select: { projectName: true },
          },
        },
      }),
      db.directExpenseRequest.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: {
            select: { name: true, email: true },
          },
          project: {
            select: { projectName: true },
          },
        },
      }),
    ]);

    const activities = [
      ...reimbursements.map((r) => ({
        id: r.id,
        type: "REIMBURSEMENT" as const,
        description: r.description,
        amount: r.amount.toNumber(),
        status: r.status,
        user: r.submittedBy.name || r.submittedBy.email,
        project: r.project.projectName,
        date: r.createdAt,
      })),
      ...directExpenses.map((d) => ({
        id: d.id,
        type: "DIRECT_EXPENSE" as const,
        description: d.description,
        amount: d.amount.toNumber(),
        status: d.status,
        user: d.createdBy.name || d.createdBy.email,
        project: d.project?.projectName || "No Project",
        date: d.createdAt,
      })),
    ];

    return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, limit);
  }

  // ============================================
  // FINANCE DASHBOARD QUERIES
  // ============================================

  async getFinanceOverview() {
    const now = new Date();
    const startMonth = startOfMonth(now);
    const endMonth = endOfMonth(now);

    const [
      approvedReimbursements,
      approvedReimbursementsAmount,
      approvedDirectExpenses,
      approvedDirectExpensesAmount,
      paidThisMonth,
      paidThisMonthAmount,
    ] = await Promise.all([
      db.reimbursement.count({ where: { status: ReimbursementStatus.APPROVED } }),
      db.reimbursement.aggregate({
        where: { status: ReimbursementStatus.APPROVED },
        _sum: { amount: true },
      }),
      db.directExpenseRequest.count({ where: { status: DirectExpenseStatus.APPROVED } }),
      db.directExpenseRequest.aggregate({
        where: { status: DirectExpenseStatus.APPROVED },
        _sum: { amount: true },
      }),
      db.reimbursement.count({
        where: {
          status: ReimbursementStatus.PAID,
          paidAt: {
            gte: startMonth,
            lte: endMonth,
          },
        },
      }),
      db.reimbursement.aggregate({
        where: {
          status: ReimbursementStatus.PAID,
          paidAt: {
            gte: startMonth,
            lte: endMonth,
          },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      approvedReimbursements,
      approvedReimbursementsAmount: approvedReimbursementsAmount._sum.amount?.toNumber() || 0,
      approvedDirectExpenses,
      approvedDirectExpensesAmount: approvedDirectExpensesAmount._sum.amount?.toNumber() || 0,
      paidThisMonth,
      paidThisMonthAmount: paidThisMonthAmount._sum.amount?.toNumber() || 0,
    };
  }

  async getApprovedReimbursements(limit?: number) {
    return db.reimbursement.findMany({
      where: { status: ReimbursementStatus.APPROVED },
      include: {
        submittedBy: {
          select: { 
            id: true,
            name: true, 
            email: true,
            bankName: true,
            bankAccountNo: true,
          },
        },
        project: {
          select: { projectName: true, clientName: true },
        },
      },
      orderBy: { approvedAt: "desc" },
      take: limit,
    });
  }

  async getApprovedDirectExpenses(limit?: number) {
    return db.directExpenseRequest.findMany({
      where: { status: DirectExpenseStatus.APPROVED },
      include: {
        createdBy: {
          select: { 
            id: true,
            name: true, 
            email: true 
          },
        },
        project: {
          select: { projectName: true, clientName: true },
        },
        category: {
          select: { name: true },
        },
      },
      orderBy: { approvedAt: "desc" },
      take: limit,
    });
  }

  async getRecentPayments(limit: number = 10) {
    const [reimbursements, directExpenses] = await Promise.all([
      db.reimbursement.findMany({
        where: { status: ReimbursementStatus.PAID },
        take: limit,
        orderBy: { paidAt: "desc" },
        include: {
          submittedBy: {
            select: { name: true, email: true },
          },
          project: {
            select: { projectName: true },
          },
        },
      }),
      db.directExpenseRequest.findMany({
        where: { status: DirectExpenseStatus.PAID },
        take: limit,
        orderBy: { paidAt: "desc" },
        include: {
          createdBy: {
            select: { name: true, email: true },
          },
          project: {
            select: { projectName: true },
          },
        },
      }),
    ]);

    const payments = [
      ...reimbursements.map((r) => ({
        id: r.id,
        type: "REIMBURSEMENT" as const,
        description: r.description,
        amount: r.amount.toNumber(),
        user: r.submittedBy.name || r.submittedBy.email,
        project: r.project.projectName,
        paidAt: r.paidAt!,
      })),
      ...directExpenses.map((d) => ({
        id: d.id,
        type: "DIRECT_EXPENSE" as const,
        description: d.description,
        amount: d.amount.toNumber(),
        user: d.createdBy.name || d.createdBy.email,
        project: d.project?.projectName || "No Project",
        paidAt: d.paidAt!,
      })),
    ];

    return payments.sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime()).slice(0, limit);
  }

  async getPaymentTrend(months: number = 6) {
    const now = new Date();
    const monthsData = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const startMonth = startOfMonth(monthDate);
      const endMonth = endOfMonth(monthDate);

      const [reimbursements, directExpenses] = await Promise.all([
        db.reimbursement.aggregate({
          where: {
            status: ReimbursementStatus.PAID,
            paidAt: {
              gte: startMonth,
              lte: endMonth,
            },
          },
          _sum: { amount: true },
          _count: true,
        }),
        db.directExpenseRequest.aggregate({
          where: {
            status: DirectExpenseStatus.PAID,
            paidAt: {
              gte: startMonth,
              lte: endMonth,
            },
          },
          _sum: { amount: true },
          _count: true,
        }),
      ]);

      monthsData.push({
        month: monthDate.toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
        reimbursements: reimbursements._sum.amount?.toNumber() || 0,
        directExpenses: directExpenses._sum.amount?.toNumber() || 0,
        total: (reimbursements._sum.amount?.toNumber() || 0) + (directExpenses._sum.amount?.toNumber() || 0),
      });
    }

    return monthsData;
  }

  // ============================================
  // STAFF DASHBOARD QUERIES
  // ============================================

  async getStaffOverview(userId: string) {
    const now = new Date();
    const startMonth = startOfMonth(now);
    const endMonth = endOfMonth(now);

    const [
      totalReimbursements,
      pendingReimbursements,
      approvedReimbursements,
      paidReimbursements,
      paidThisMonth,
    ] = await Promise.all([
      db.reimbursement.count({ where: { submittedById: userId } }),
      db.reimbursement.count({
        where: {
          submittedById: userId,
          status: ReimbursementStatus.PENDING,
        },
      }),
      db.reimbursement.count({
        where: {
          submittedById: userId,
          status: ReimbursementStatus.APPROVED,
        },
      }),
      db.reimbursement.aggregate({
        where: {
          submittedById: userId,
          status: ReimbursementStatus.PAID,
        },
        _sum: { amount: true },
      }),
      db.reimbursement.aggregate({
        where: {
          submittedById: userId,
          status: ReimbursementStatus.PAID,
          paidAt: {
            gte: startMonth,
            lte: endMonth,
          },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalReimbursements,
      pendingReimbursements,
      approvedReimbursements,
      paidReimbursements: paidReimbursements._sum.amount?.toNumber() || 0,
      paidThisMonth: paidThisMonth._sum.amount?.toNumber() || 0,
    };
  }

  async getStaffReimbursements(userId: string, limit?: number) {
    return db.reimbursement.findMany({
      where: { submittedById: userId },
      include: {
        project: {
          select: { projectName: true, clientName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async getStaffReimbursementsByStatus(userId: string) {
    const reimbursements = await db.reimbursement.groupBy({
      by: ["status"],
      where: { submittedById: userId },
      _count: true,
      _sum: { amount: true },
    });

    return reimbursements.map((r) => ({
      status: r.status,
      count: r._count,
      total: r._sum.amount?.toNumber() || 0,
    }));
  }

  async getStaffMonthlyReimbursements(userId: string, months: number = 6) {
    const now = new Date();
    const monthsData = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const startMonth = startOfMonth(monthDate);
      const endMonth = endOfMonth(monthDate);

      const reimbursements = await db.reimbursement.aggregate({
        where: {
          submittedById: userId,
          createdAt: {
            gte: startMonth,
            lte: endMonth,
          },
        },
        _sum: { amount: true },
        _count: true,
      });

      monthsData.push({
        month: monthDate.toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
        amount: reimbursements._sum.amount?.toNumber() || 0,
        count: reimbursements._count,
      });
    }

    return monthsData;
  }

  async getStaffBankInfo(userId: string) {
    return db.user.findUnique({
      where: { id: userId },
      select: {
        bankName: true,
        bankAccountNo: true,
        name: true,
      },
    });
  }
}
