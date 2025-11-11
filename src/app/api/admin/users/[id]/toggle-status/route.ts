/**
 * Admin Toggle User Status API Route
 * POST /api/admin/users/[id]/toggle-status - Toggle user active status
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { adminUserService } from "@/server/service/admin/user.service";
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

    // Prevent admin from toggling their own status
    if (session.user.id === params.id) {
      return NextResponse.json(
        { success: false, error: "Cannot toggle your own status" },
        { status: 400 }
      );
    }

    // Toggle status
    const user = await adminUserService.toggleUserStatus(params.id);

    return NextResponse.json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
      data: user,
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    
    if (error instanceof Error && error.message === "User not found") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to toggle user status",
      },
      { status: 500 }
    );
  }
}
