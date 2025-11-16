/**
 * API Route: /api/staff/reimbursements
 * Staff Reimbursement - List & Submit
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { staffReimbursementService } from "@/server/service/staff/reimbursement.service";
import { CreateReimbursementSchema, ReimbursementFilterSchema } from "@/server/schema";
import { UserRole } from "@/server/schema/enums";

/**
 * GET /api/staff/reimbursements
 * Get my reimbursements
 * @access STAFF only
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role: STAFF only
    if (session.user.role !== UserRole.STAFF) {
      return NextResponse.json(
        { error: "Forbidden: Only STAFF can access this endpoint" },
        { status: 403 }
      );
    }

    // Parse query params
    const searchParams = req.nextUrl.searchParams;
    const statusParam = searchParams.get("status");
    
    const filters = {
      status: statusParam ? (statusParam as any) : undefined,
      search: searchParams.get("search") ?? undefined,
      fromDate: searchParams.get("fromDate") ?? undefined,
      toDate: searchParams.get("toDate") ?? undefined,
      page: parseInt(searchParams.get("page") ?? "1"),
      limit: parseInt(searchParams.get("limit") ?? "10"),
      sortBy: (searchParams.get("sortBy") as any) ?? "submittedAt",
      sortOrder: (searchParams.get("sortOrder") as any) ?? "desc",
    };

    const result = await staffReimbursementService.getMyReimbursements(
      session.user.id,
      filters
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error getting reimbursements:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get reimbursements" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/staff/reimbursements
 * Submit new reimbursement
 * @access STAFF only
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role: STAFF only
    if (session.user.role !== UserRole.STAFF) {
      return NextResponse.json(
        { error: "Forbidden: Only STAFF can submit reimbursements" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input
    const validatedData = CreateReimbursementSchema.parse(body);

    const reimbursement = await staffReimbursementService.submitReimbursement(
      validatedData,
      session.user.id
    );

    return NextResponse.json(reimbursement, { status: 201 });
  } catch (error: any) {
    console.error("Error submitting reimbursement:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to submit reimbursement" },
      { status: 500 }
    );
  }
}
