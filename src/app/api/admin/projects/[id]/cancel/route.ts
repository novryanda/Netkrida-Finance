/**
 * Admin Project Cancel API Route
 * POST /api/admin/projects/[id]/cancel - Cancel project
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

    // Cancel project
    const project = await adminProjectService.cancelProject(params.id);

    return NextResponse.json({
      success: true,
      message: "Project cancelled successfully",
      data: project,
    });
  } catch (error) {
    console.error("Error cancelling project:", error);

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
          error instanceof Error ? error.message : "Failed to cancel project",
      },
      { status: 500 }
    );
  }
}
