/**
 * API Route: /api/expenses/dashboard
 * Get dashboard statistics
 */

import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { expenseService } from "@/server/service/admin/expense.service";

/**
 * GET /api/expenses/dashboard
 * Get dashboard statistics
 * @access ALL authenticated users
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const statistics = await expenseService.getDashboardStatistics(
      session.user.id,
      session.user.role
    );

    return NextResponse.json(statistics);
  } catch (error: any) {
    console.error("Error getting dashboard statistics:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get dashboard statistics" },
      { status: 500 }
    );
  }
}
