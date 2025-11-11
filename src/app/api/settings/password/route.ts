/**
 * Settings Password API Routes
 * Endpoint untuk change password
 */

import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { settingsService } from "@/server/service/settings/settings.service";
import { ChangePasswordSchema } from "@/server/schema/settings.schema";

/**
 * PUT /api/settings/password
 * Change user password
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
    const validatedData = ChangePasswordSchema.parse(body);

    // Change password
    const result = await settingsService.changePassword(
      session.user.id,
      validatedData
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error changing password:", error);

    if (error instanceof Error) {
      // Handle specific errors
      if (error.message.includes("Current password is incorrect")) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        );
      }

      if (error.message.includes("validation")) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to change password",
      },
      { status: 500 }
    );
  }
}
