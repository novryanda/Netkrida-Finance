/**
 * API Route: /api/finance/reimbursements
 * Finance Reimbursement - List (to review, to pay)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { reimbursementService } from "@/server/service/finance/reimbursement.service";
import { UserRole, ReimbursementStatus } from "@/server/schema/enums";

/**
 * GET /api/finance/reimbursements
 * Get reimbursements based on query type
 * @access FINANCE only
 */
export async function GET(req: NextRequest) {
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

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get("type"); // 'pending', 'to_pay'
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    let result;

    if (type === "pending") {
      // Pending reimbursements to review
      result = await reimbursementService.getPendingToReview(page, limit);
    } else if (type === "to_pay") {
      // ALL Approved reimbursements to pay (not just reviewed by current user)
      // Any FINANCE can process payment for approved reimbursements
      console.log('[API Reimbursement] Fetching to_pay with status:', ReimbursementStatus.APPROVED);
      result = await reimbursementService.getReimbursements({
        status: ReimbursementStatus.APPROVED,
        page,
        limit,
        sortBy: "approvedAt",
        sortOrder: "asc",
      });
    } else {
      // All reimbursements with optional status filter
      const filters: any = {
        page,
        limit,
        sortBy: "submittedAt",
        sortOrder: "desc",
      };
      
      if (status && status !== "ALL") {
        filters.status = status;
      }
      
      result = await reimbursementService.getReimbursements(filters);
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
