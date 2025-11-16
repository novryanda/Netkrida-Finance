/**
 * API Route: /api/finance/reimbursements/[id]
 * Finance Reimbursement - Get Detail
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { reimbursementService } from "@/server/service/finance/reimbursement.service";
import { UserRole } from "@/server/schema/enums";

/**
 * GET /api/finance/reimbursements/[id]
 * Get reimbursement detail
 * @access FINANCE only
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;
    const reimbursement = await reimbursementService.getReimbursementById(id);

    return NextResponse.json(reimbursement);
  } catch (error: any) {
    console.error("Error getting reimbursement:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get reimbursement" },
      { status: error.message.includes("not found") ? 404 : 500 }
    );
  }
}
