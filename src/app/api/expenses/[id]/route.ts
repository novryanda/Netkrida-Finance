/**
 * API Route: /api/expenses/[id]
 * Get expense detail
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { expenseService } from "@/server/service/admin/expense.service";
import { UserRole } from "@/server/schema/enums";

/**
 * GET /api/expenses/[id]
 * Get expense by ID
 * @access ADMIN, FINANCE
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

    const expense = await expenseService.getExpenseById(params.id);

    return NextResponse.json(expense);
  } catch (error: any) {
    console.error("Error getting expense:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get expense" },
      { status: error.message.includes("not found") ? 404 : 500 }
    );
  }
}
