/**
 * API Route: /api/admin/reimbursements/statistics
 * Get reimbursement statistics for Admin role
 */

import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { reimbursementService } from "@/server/service/finance/reimbursement.service";
import { UserRole } from "@/server/schema/enums";

/**
 * GET /api/admin/reimbursements/statistics
 * Get reimbursement statistics for Admin role (all reimbursements)
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

    // Get statistics for all reimbursements
    const statistics = await reimbursementService.getStatistics();

    return NextResponse.json(statistics);
  } catch (error: any) {
    console.error("Error getting reimbursement statistics:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get statistics" },
      { status: 500 }
    );
  }
}
