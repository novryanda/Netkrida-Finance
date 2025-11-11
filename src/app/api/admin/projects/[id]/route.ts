/**
 * Admin Project Detail API Routes
 * GET /api/admin/projects/[id] - Get project by ID
 * PATCH /api/admin/projects/[id] - Update project
 * DELETE /api/admin/projects/[id] - Delete project
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { adminProjectService } from "@/server/service/admin/project.service";
import { UpdateProjectSchema } from "@/server/schema";
import { UserRole } from "@/server/schema/enums";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get project
    const project = await adminProjectService.getProjectById(params.id);

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Error fetching project:", error);

    if (error instanceof Error && error.message === "Project not found") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch project",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = UpdateProjectSchema.parse(body);

    // Update project
    const project = await adminProjectService.updateProject(
      params.id,
      validatedData,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("Error updating project:", error);

    if (error instanceof Error && error.message === "Project not found") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update project",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Delete project
    await adminProjectService.deleteProject(params.id);

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);

    if (error instanceof Error && error.message === "Project not found") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete project",
      },
      { status: 500 }
    );
  }
}
