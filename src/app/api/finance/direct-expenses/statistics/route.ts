/**
 * API Route: /api/finance/direct-expenses/statistics
 * Get direct expense statistics for Finance role
 */

import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { directExpenseService } from "@/server/service/finance/directExpense.service";
import { UserRole } from "@/server/schema/enums";

/**
 * GET /api/finance/direct-expenses/statistics
 * Get direct expense statistics for Finance role (their own expenses)
 * @access FINANCE only
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role: FINANCE only
    if (session.user.role !== UserRole.FINANCE) {
      return NextResponse.json(
        { error: "Forbidden: Only FINANCE can access this endpoint" },
        { status: 403 }
      );
    }

    // Get statistics for expenses created by this user
    const statistics = await directExpenseService.getStatistics(session.user.id);

    return NextResponse.json(statistics);
  } catch (error: any) {
    console.error("Error getting direct expense statistics:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get statistics" },
      { status: 500 }
    );
  }
}
