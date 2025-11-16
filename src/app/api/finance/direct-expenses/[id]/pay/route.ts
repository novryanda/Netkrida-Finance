/**
 * API Route: /api/finance/direct-expenses/[id]/pay
 * FINANCE Mark Direct Expense as Paid
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { directExpenseService } from "@/server/service/finance/directExpense.service";
import { markDirectExpenseAsPaidSchema } from "@/server/schema";
import { UserRole } from "@/server/schema/enums";

/**
 * POST /api/finance/direct-expenses/[id]/pay
 * Mark direct expense as paid
 * @access FINANCE only (any finance user can pay approved expenses)
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
        { error: "Forbidden: Only FINANCE can mark direct expenses as paid" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input
    const validatedData = markDirectExpenseAsPaidSchema.parse(body);

    const result = await directExpenseService.markAsPaid(
      params.id,
      session.user.id,
      validatedData
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error marking direct expense as paid:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to mark direct expense as paid" },
      { status: error.message.includes("not found") ? 404 : 500 }
    );
  }
}
