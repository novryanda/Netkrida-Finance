/**
 * Settings Profile API Routes
 * Endpoint untuk update profile user
 */

import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { settingsService } from "@/server/service/settings/settings.service";
import { UpdateProfileSchema } from "@/server/schema/settings.schema";

/**
 * GET /api/settings/profile
 * Get current user profile
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await settingsService.getUserProfile(session.user.id);

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch profile",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings/profile
 * Update current user profile
 */
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = UpdateProfileSchema.parse(body);

    // Update profile
    const result = await settingsService.updateProfile(
      session.user.id,
      validatedData
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating profile:", error);

    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update profile",
      },
      { status: 500 }
    );
  }
}
