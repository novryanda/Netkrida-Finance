/**
 * API Route: /api/admin/reimbursements
 * Admin Reimbursement - List (to approve)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { reimbursementService } from "@/server/service/finance/reimbursement.service";
import { UserRole } from "@/server/schema/enums";

/**
 * GET /api/admin/reimbursements
 * Get reimbursements for approval
 * @access ADMIN only
 */
export async function GET(req: NextRequest) {
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

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get("type"); // 'to_approve'
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    let result;

    if (type === "to_approve") {
      // Reviewed reimbursements waiting for approval
      result = await reimbursementService.getReviewedToApprove(page, limit);
    } else {
      // All reimbursements
      result = await reimbursementService.getReimbursements({
        page,
        limit,
        sortBy: "submittedAt",
        sortOrder: "desc",
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error getting reimbursements:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get reimbursements" },
      { status: 500 }
    );
  }
}
