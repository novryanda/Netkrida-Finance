/**
 * Uploads API Routes
 * Endpoint untuk upload dan delete profile picture
 */

import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { settingsService } from "@/server/service/settings/settings.service";
import fs from "fs";
import path from "path";

// Disable body parser untuk handle file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * POST /api/uploads
 * Upload profile picture
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Convert Request to FormData
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file type. Only JPEG, PNG, and WebP are allowed",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "File size too large. Maximum size is 5MB",
        },
        { status: 400 }
      );
    }

    // Create uploads directory if not exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const filename = `profile-${session.user.id}-${timestamp}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    // Generate image URL using API route
    const imageUrl = `/api/uploads/${filename}`;

    // Update user profile picture in database
    await settingsService.updateProfilePicture(session.user.id, imageUrl);

    return NextResponse.json({
      success: true,
      message: "Profile picture uploaded successfully",
      imageUrl,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to upload profile picture",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/uploads
 * Delete profile picture
 */
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current user profile
    const user = await settingsService.getUserProfile(session.user.id);

    if (user.image) {
      // Extract filename from URL (remove /api/uploads/ prefix)
      const filename = user.image.replace("/api/uploads/", "");
      
      // Delete file from filesystem
      const filepath = path.join(process.cwd(), "public", "uploads", filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    // Remove image URL from database
    await settingsService.updateProfilePicture(session.user.id, "");

    return NextResponse.json({
      success: true,
      message: "Profile picture deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete profile picture",
      },
      { status: 500 }
    );
  }
}
