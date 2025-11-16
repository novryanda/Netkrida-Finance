/**
 * API Route: /api/admin/direct-expenses/[id]/approve
 * ADMIN Approve Direct Expense
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { directExpenseService } from "@/server/service/finance/directExpense.service";
import { approveDirectExpenseSchema } from "@/server/schema";
import { UserRole } from "@/server/schema/enums";

/**
 * POST /api/admin/direct-expenses/[id]/approve
 * Approve direct expense
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
        { error: "Forbidden: Only ADMIN can approve direct expenses" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input
    const validatedData = approveDirectExpenseSchema.parse(body);

    const directExpense = await directExpenseService.approveDirectExpense(
      params.id,
      session.user.id,
      validatedData
    );

    return NextResponse.json(directExpense);
  } catch (error: any) {
    console.error("Error approving direct expense:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to approve direct expense" },
      { status: error.message.includes("not found") ? 404 : 500 }
    );
  }
}
