/**
 * Finance Projects API Route
 * GET /api/finance/projects - Get all projects (read-only untuk Finance)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { financeProjectService } from "@/server/service/finance/project.service";
import { ProjectStatus } from "@/server/schema/enums";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is Finance
    if (session.user.role !== "FINANCE") {
      return NextResponse.json(
        { error: "Forbidden - Finance access only" },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") as ProjectStatus | undefined;
    const clientName = searchParams.get("clientName") || undefined;
    const fromDate = searchParams.get("fromDate") || undefined;
    const toDate = searchParams.get("toDate") || undefined;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

    // Get projects
    const result = await financeProjectService.getAllProjects({
      page,
      limit,
      search,
      status,
      clientName,
      fromDate,
      toDate,
      sortBy,
      sortOrder,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error in GET /api/finance/projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
