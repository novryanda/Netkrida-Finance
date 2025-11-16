/**
 * API Route: /api/admin/categories/[id]/expenses
 * Get all expenses for a specific category
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { UserRole } from "@/server/schema/enums";

/**
 * GET /api/admin/categories/[id]/expenses
 * Get all expenses (both direct expenses and reimbursements) for a category
 * @access ADMIN only
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role: ADMIN only
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Only ADMIN can access this endpoint" },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const skip = (page - 1) * limit;

    // Get category details
    const category = await db.expenseCategory.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            expenses: true,
            directExpenses: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Get all expenses for this category
    const [expenses, total] = await Promise.all([
      db.expense.findMany({
        where: { categoryId: params.id },
        include: {
          project: {
            select: {
              id: true,
              projectName: true,
              clientName: true,
            },
          },
          recordedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { expenseDate: "desc" },
        skip,
        take: limit,
      }),
      db.expense.count({ where: { categoryId: params.id } }),
    ]);

    // Get direct expenses for this category (all statuses)
    const directExpenses = await db.directExpenseRequest.findMany({
      where: { categoryId: params.id },
      include: {
        project: {
          select: {
            id: true,
            projectName: true,
            clientName: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate statistics
    const totalAmount = await db.expense.aggregate({
      where: { categoryId: params.id },
      _sum: { amount: true },
    });

    const directExpenseAmount = await db.directExpenseRequest.aggregate({
      where: { 
        categoryId: params.id,
        status: "PAID", // Only count paid expenses
      },
      _sum: { amount: true },
    });

    // Group by project
    const expensesByProject = await db.expense.groupBy({
      by: ['projectId'],
      where: { categoryId: params.id },
      _sum: { amount: true },
      _count: true,
    });

    // Get project details for grouped data
    const projectIds = expensesByProject
      .map(e => e.projectId)
      .filter((id): id is string => id !== null);
    
    const projects = await db.project.findMany({
      where: { id: { in: projectIds } },
      select: {
        id: true,
        projectName: true,
        clientName: true,
      },
    });

    const projectMap = new Map(projects.map(p => [p.id, p]));

    const projectBreakdown = expensesByProject.map(item => ({
      project: item.projectId ? projectMap.get(item.projectId) : null,
      totalAmount: item._sum.amount?.toNumber() || 0,
      count: item._count,
    }));

    return NextResponse.json({
      category,
      expenses,
      directExpenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statistics: {
        totalExpenses: total,
        totalDirectExpenses: directExpenses.length,
        totalAmount: (totalAmount._sum.amount?.toNumber() || 0) + (directExpenseAmount._sum.amount?.toNumber() || 0),
        expensesAmount: totalAmount._sum.amount?.toNumber() || 0,
        directExpensesAmount: directExpenseAmount._sum.amount?.toNumber() || 0,
        projectBreakdown,
      },
    });
  } catch (error: any) {
    console.error("Error getting category expenses:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get category expenses" },
      { status: 500 }
    );
  }
}
