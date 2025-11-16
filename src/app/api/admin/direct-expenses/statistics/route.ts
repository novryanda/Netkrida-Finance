/**
 * API Route: /api/admin/direct-expenses/statistics
 * Get direct expense statistics for Admin role
 */

import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { directExpenseService } from "@/server/service/finance/directExpense.service";
import { UserRole } from "@/server/schema/enums";

/**
 * GET /api/admin/direct-expenses/statistics
 * Get direct expense statistics for Admin role (all expenses)
 * @access ADMIN only
 */
export async function GET() {
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

    // Get statistics for all direct expenses
    const statistics = await directExpenseService.getStatistics();

    return NextResponse.json(statistics);
  } catch (error: any) {
    console.error("Error getting direct expense statistics:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get statistics" },
      { status: 500 }
    );
  }
}
