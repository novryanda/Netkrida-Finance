/**
 * API Route: /api/admin/direct-expenses
 * Admin Direct Expense - List (to approve)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { directExpenseService } from "@/server/service/finance/directExpense.service";
import { UserRole, DirectExpenseStatus } from "@/server/schema/enums";

/**
 * GET /api/admin/direct-expenses
 * Get direct expenses for approval
 * @access ADMIN only
 */
export async function GET(req: NextRequest) {
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
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const search = searchParams.get("search") ?? "";
    const statusParam = searchParams.get("status") ?? "";

    const result = await directExpenseService.getDirectExpenses({
      page,
      limit,
      status: statusParam && Object.values(DirectExpenseStatus).includes(statusParam as DirectExpenseStatus) 
        ? (statusParam as DirectExpenseStatus)
        : undefined,
    });

    // Transform response to match component expectations
    return NextResponse.json({
      data: result.directExpenses,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("Error getting direct expenses:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get direct expenses" },
      { status: 500 }
    );
  }
}
