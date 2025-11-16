/**
 * API Route: /api/expenses/report
 * Get expense reports with grouping
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { expenseService } from "@/server/service/admin/expense.service";
import { expenseReportSchema } from "@/server/schema";
import { UserRole } from "@/server/schema/enums";

/**
 * GET /api/expenses/report
 * Get expense report
 * @access ADMIN, FINANCE
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role: ADMIN or FINANCE
    if (
      session.user.role !== UserRole.ADMIN &&
      session.user.role !== UserRole.FINANCE
    ) {
      return NextResponse.json(
        { error: "Forbidden: Only ADMIN or FINANCE can access reports" },
        { status: 403 }
      );
    }

    // Parse query params
    const searchParams = req.nextUrl.searchParams;
    const params = {
      projectId: searchParams.get("projectId") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      startDate: searchParams.get("startDate") ?? new Date().toISOString(),
      endDate: searchParams.get("endDate") ?? new Date().toISOString(),
      groupBy: (searchParams.get("groupBy") as any) ?? "category",
    };

    // Validate params
    const validatedParams = expenseReportSchema.parse(params);

    const report = await expenseService.getExpenseReport(validatedParams);

    return NextResponse.json(report);
  } catch (error: any) {
    console.error("Error getting expense report:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to get expense report" },
      { status: 500 }
    );
  }
}
