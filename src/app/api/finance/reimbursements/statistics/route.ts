/**
 * API Route: /api/finance/reimbursements/statistics
 * Get finance reimbursement statistics
 */

import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { reimbursementService } from "@/server/service/finance/reimbursement.service";
import { UserRole } from "@/server/schema/enums";

/**
 * GET /api/finance/reimbursements/statistics
 * Get reimbursement statistics for Finance role
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

    const statistics = await reimbursementService.getStatistics();

    return NextResponse.json(statistics);
  } catch (error: any) {
    console.error("Error getting statistics:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get statistics" },
      { status: 500 }
    );
  }
}
