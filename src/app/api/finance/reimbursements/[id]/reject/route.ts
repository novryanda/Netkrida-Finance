/**
 * API Route: /api/finance/reimbursements/[id]/reject
 * FINANCE Reject Reimbursement
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { reimbursementService } from "@/server/service/finance/reimbursement.service";
import { RejectReimbursementSchema } from "@/server/schema";
import { UserRole } from "@/server/schema/enums";

/**
 * POST /api/finance/reimbursements/[id]/reject
 * Reject reimbursement
 * @access FINANCE only
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role: FINANCE only
    if (session.user.role !== UserRole.FINANCE) {
      return NextResponse.json(
        { error: "Forbidden: Only FINANCE can reject reimbursements" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input
    const validatedData = RejectReimbursementSchema.parse(body);

    const reimbursement = await reimbursementService.rejectByFinance(
      params.id,
      session.user.id,
      validatedData
    );

    return NextResponse.json(reimbursement);
  } catch (error: any) {
    console.error("Error rejecting reimbursement:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to reject reimbursement" },
      { status: error.message.includes("not found") ? 404 : 500 }
    );
  }
}
