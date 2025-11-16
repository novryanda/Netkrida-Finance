/**
 * API Route: /api/expenses
 * Expense - List & Reports
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { expenseService } from "@/server/service/admin/expense.service";
import { getExpensesSchema } from "@/server/schema";
import { UserRole } from "@/server/schema/enums";

/**
 * GET /api/expenses
 * Get all expenses with filters
 * @access ADMIN, FINANCE
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role: ADMIN or FINANCE
    if (
      session.user.role !== UserRole.ADMIN &&
      session.user.role !== UserRole.FINANCE
    ) {
      return NextResponse.json(
        { error: "Forbidden: Only ADMIN or FINANCE can access expenses" },
        { status: 403 }
      );
    }

    // Parse query params
    const searchParams = req.nextUrl.searchParams;
    const filters = {
      projectId: searchParams.get("projectId") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      sourceType: searchParams.get("sourceType") as any,
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      page: parseInt(searchParams.get("page") ?? "1"),
      limit: parseInt(searchParams.get("limit") ?? "20"),
      sortBy: (searchParams.get("sortBy") as any) ?? "expenseDate",
      sortOrder: (searchParams.get("sortOrder") as any) ?? "desc",
    };

    // Validate filters
    const validatedFilters = getExpensesSchema.parse(filters);

    const result = await expenseService.getExpenses(validatedFilters);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error getting expenses:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to get expenses" },
      { status: 500 }
    );
  }
}
