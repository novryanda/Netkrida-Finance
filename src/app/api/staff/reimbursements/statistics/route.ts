/**
 * API Route: /api/staff/reimbursements/statistics
 * Get staff reimbursement statistics
 */

import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { staffReimbursementService } from "@/server/service/staff/reimbursement.service";
import { UserRole } from "@/server/schema/enums";

/**
 * GET /api/staff/reimbursements/statistics
 * Get my reimbursement statistics
 * @access STAFF only
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role: STAFF only
    if (session.user.role !== UserRole.STAFF) {
      return NextResponse.json(
        { error: "Forbidden: Only STAFF can access this endpoint" },
        { status: 403 }
      );
    }

    const statistics = await staffReimbursementService.getMyStatistics(
      session.user.id
    );

    return NextResponse.json(statistics);
  } catch (error: any) {
    console.error("Error getting statistics:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get statistics" },
      { status: 500 }
    );
  }
}
