/**
 * API Route: /api/finance/direct-expenses/[id]
 * Finance Direct Expense - Get Detail
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { directExpenseService } from "@/server/service/finance/directExpense.service";
import { UserRole } from "@/server/schema/enums";

/**
 * GET /api/finance/direct-expenses/[id]
 * Get direct expense detail
 * @access FINANCE only
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

    // Check role: FINANCE only
    if (session.user.role !== UserRole.FINANCE) {
      return NextResponse.json(
        { error: "Forbidden: Only FINANCE can access this endpoint" },
        { status: 403 }
      );
    }

    const directExpense = await directExpenseService.getDirectExpenseById(
      params.id
    );

    return NextResponse.json(directExpense);
  } catch (error: any) {
    console.error("Error getting direct expense:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get direct expense" },
      { status: error.message.includes("not found") ? 404 : 500 }
    );
  }
}
