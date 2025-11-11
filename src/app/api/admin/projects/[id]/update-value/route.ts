/**
 * Admin Project Update Value API Route
 * POST /api/admin/projects/[id]/update-value - Update project value with revision
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { adminProjectService } from "@/server/service/admin/project.service";
import { UserRole } from "@/server/schema/enums";
import { z } from "zod";

const UpdateValueSchema = z.object({
  newValue: z.number().positive("New value must be positive"),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = UpdateValueSchema.parse(body);

    // Update project value
    const project = await adminProjectService.updateProjectValue(
      params.id,
      validatedData,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      message: "Project value updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("Error updating project value:", error);

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
            : "Failed to update project value",
      },
      { status: 500 }
    );
  }
}
