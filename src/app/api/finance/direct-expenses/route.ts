/**
 * API Route: /api/finance/direct-expenses
 * Finance Direct Expense - List & Create
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { directExpenseService } from "@/server/service/finance/directExpense.service";
import { createDirectExpenseSchema } from "@/server/schema";
import { UserRole, DirectExpenseStatus } from "@/server/schema/enums";

/**
 * GET /api/finance/direct-expenses
 * Get direct expenses based on query type
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
    const type = searchParams.get("type"); // 'to_pay'
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    let result;

    if (type === "to_pay") {
      // All approved direct expenses to pay (not just created by current user)
      // Finance can pay any approved expense
      console.log('[API] Fetching approved expenses for to_pay');
      result = await directExpenseService.getDirectExpenses({
        status: DirectExpenseStatus.APPROVED,
        page,
        limit,
      });
      console.log('[API] Approved expenses result:', {
        count: result.directExpenses?.length || 0,
        total: result.pagination?.total || 0,
        firstItem: result.directExpenses?.[0]?.id
      });
    } else {
      // All my direct expenses with optional status filter
      const filters: any = {
        page,
        limit,
      };
      
      if (status && status !== "ALL") {
        filters.status = status;
      }
      
      result = await directExpenseService.getMyDirectExpenses(
        session.user.id,
        filters
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error getting direct expenses:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get direct expenses" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/finance/direct-expenses
 * Create new direct expense request
 * @access FINANCE only
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role: FINANCE only
    if (session.user.role !== UserRole.FINANCE) {
      return NextResponse.json(
        { error: "Forbidden: Only FINANCE can create direct expenses" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input
    const validatedData = createDirectExpenseSchema.parse(body);

    const directExpense = await directExpenseService.createDirectExpense(
      validatedData,
      session.user.id
    );

    return NextResponse.json(directExpense, { status: 201 });
  } catch (error: any) {
    console.error("Error creating direct expense:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create direct expense" },
      { status: 500 }
    );
  }
}
