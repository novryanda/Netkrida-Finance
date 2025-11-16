/**
 * API Route: /api/finance/reimbursements/[id]/pay
 * FINANCE Mark as Paid
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { reimbursementService } from "@/server/service/finance/reimbursement.service";
import { PayReimbursementSchema } from "@/server/schema";
import { UserRole } from "@/server/schema/enums";

/**
 * POST /api/finance/reimbursements/[id]/pay
 * Mark reimbursement as paid
 * @access FINANCE only (must be reviewer)
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
        { error: "Forbidden: Only FINANCE can mark reimbursements as paid" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input
    const validatedData = PayReimbursementSchema.parse(body);

    const result = await reimbursementService.markAsPaid(
      params.id,
      session.user.id,
      validatedData
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error marking reimbursement as paid:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to mark reimbursement as paid" },
      { status: error.message.includes("not found") ? 404 : 500 }
    );
  }
}
