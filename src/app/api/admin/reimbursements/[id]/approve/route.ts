/**
 * API Route: /api/admin/reimbursements/[id]/approve
 * ADMIN Approve Reimbursement
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { reimbursementService } from "@/server/service/finance/reimbursement.service";
import { ApproveReimbursementSchema } from "@/server/schema";
import { UserRole } from "@/server/schema/enums";

/**
 * POST /api/admin/reimbursements/[id]/approve
 * Approve reimbursement
 * @access ADMIN only
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

    // Check role: ADMIN only
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Only ADMIN can approve reimbursements" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input
    const validatedData = ApproveReimbursementSchema.parse(body);

    const reimbursement = await reimbursementService.approveReimbursement(
      params.id,
      session.user.id,
      validatedData
    );

    return NextResponse.json(reimbursement);
  } catch (error: any) {
    console.error("Error approving reimbursement:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to approve reimbursement" },
      { status: error.message.includes("not found") ? 404 : 500 }
    );
  }
}
