/**
 * API Route: /api/admin/reimbursements/[id]
 * Admin Reimbursement - Get Detail
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { reimbursementService } from "@/server/service/finance/reimbursement.service";
import { UserRole } from "@/server/schema/enums";

/**
 * GET /api/admin/reimbursements/[id]
 * Get reimbursement detail
 * @access ADMIN only
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

    // Check role: ADMIN only
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Only ADMIN can access this endpoint" },
        { status: 403 }
      );
    }

    const reimbursement = await reimbursementService.getReimbursementById(
      params.id
    );

    return NextResponse.json(reimbursement);
  } catch (error: any) {
    console.error("Error getting reimbursement:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get reimbursement" },
      { status: error.message.includes("not found") ? 404 : 500 }
    );
  }
}
