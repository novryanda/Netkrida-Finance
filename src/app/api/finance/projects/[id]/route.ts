/**
 * Finance Project Detail API Route
 * GET /api/finance/projects/[id] - Get project by ID (read-only untuk Finance)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { financeProjectService } from "@/server/service/finance/project.service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Get project
    const result = await financeProjectService.getProjectById(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "Project not found" ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in GET /api/finance/projects/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
