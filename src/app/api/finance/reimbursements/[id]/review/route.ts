/**
 * API Route: /api/finance/reimbursements/[id]/review
 * FINANCE Review & Forward to ADMIN
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { reimbursementService } from "@/server/service/finance/reimbursement.service";
import { ReviewReimbursementSchema } from "@/server/schema";
import { UserRole } from "@/server/schema/enums";

/**
 * POST /api/finance/reimbursements/[id]/review
 * Review and forward reimbursement to ADMIN
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
        { error: "Forbidden: Only FINANCE can review reimbursements" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input
    const validatedData = ReviewReimbursementSchema.parse(body);

    const reimbursement = await reimbursementService.reviewReimbursement(
      params.id,
      session.user.id,
      validatedData
    );

    return NextResponse.json(reimbursement);
  } catch (error: any) {
    console.error("Error reviewing reimbursement:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to review reimbursement" },
      { status: error.message.includes("not found") ? 404 : 500 }
    );
  }
}
