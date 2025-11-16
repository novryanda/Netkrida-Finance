/**
 * API Route: /api/staff/reimbursements/[id]
 * Staff Reimbursement - Get Detail
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { staffReimbursementService } from "@/server/service/staff/reimbursement.service";
import { UserRole } from "@/server/schema/enums";

/**
 * GET /api/staff/reimbursements/[id]
 * Get my reimbursement detail
 * @access STAFF only (own reimbursements)
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

    // Check role: STAFF only
    if (session.user.role !== UserRole.STAFF) {
      return NextResponse.json(
        { error: "Forbidden: Only STAFF can access this endpoint" },
        { status: 403 }
      );
    }

    const reimbursement = await staffReimbursementService.getMyReimbursementById(
      params.id,
      session.user.id
    );

    return NextResponse.json(reimbursement);
  } catch (error: any) {
    console.error("Error getting reimbursement:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get reimbursement" },
      { status: error.message.includes("not found") ? 404 : error.message.includes("Forbidden") ? 403 : 500 }
    );
  }
}
