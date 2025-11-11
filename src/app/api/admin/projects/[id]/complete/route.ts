/**
 * Admin Project Complete API Route
 * POST /api/admin/projects/[id]/complete - Mark project as completed
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { adminProjectService } from "@/server/service/admin/project.service";
import { UserRole } from "@/server/schema/enums";

export async function POST(
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

    // Complete project
    const project = await adminProjectService.completeProject(params.id);

    return NextResponse.json({
      success: true,
      message: "Project marked as completed",
      data: project,
    });
  } catch (error) {
    console.error("Error completing project:", error);

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
          error instanceof Error
            ? error.message
            : "Failed to complete project",
      },
      { status: 500 }
    );
  }
}
