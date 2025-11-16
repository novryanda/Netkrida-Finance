/**
 * API Route: /api/admin/direct-expenses/[id]
 * Admin Direct Expense - Get Detail
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { directExpenseService } from "@/server/service/finance/directExpense.service";
import { UserRole } from "@/server/schema/enums";

/**
 * GET /api/admin/direct-expenses/[id]
 * Get direct expense detail
 * @access ADMIN only
 */
export async function GET(
  req: NextRequest,
  context: { params: { id: string | Promise<string> } }
) {
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


    let id = context.params.id;
    if (typeof id === 'object' && typeof id.then === 'function') {
      id = await id;
    }
    if (typeof id !== 'string') {
      throw new Error('Invalid id parameter');
    }
    const directExpense = await directExpenseService.getDirectExpenseById(id);

    return NextResponse.json(directExpense);
  } catch (error: any) {
    console.error("Error getting direct expense:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get direct expense" },
      { status: error.message.includes("not found") ? 404 : 500 }
    );
  }
}
