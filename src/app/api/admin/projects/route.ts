/**
 * Admin Projects API Routes
 * GET /api/admin/projects - Get all projects
 * POST /api/admin/projects - Create new project
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { adminProjectService } from "@/server/service/admin/project.service";
import { CreateProjectSchema } from "@/server/schema";
import { UserRole, ProjectStatus } from "@/server/schema/enums";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin only" },
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
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // Get projects
    const result = await adminProjectService.getAllProjects({
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

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch projects",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreateProjectSchema.parse(body);

    // Create project
    const project = await adminProjectService.createProject(
      validatedData,
      session.user.id
    );

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
        data: project,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating project:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create project",
      },
      { status: 500 }
    );
  }
}
