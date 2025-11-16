/**
 * API Route: /api/upload/payment-proof
 * Upload payment proof file
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import {
  uploadPaymentProof,
  validateFileSize,
  validateImageType,
} from "@/lib/fileUpload";
import { UserRole } from "@/server/schema/enums";

/**
 * POST /api/upload/payment-proof
 * Upload payment proof image
 * @access FINANCE only
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role: FINANCE only
    if (session.user.role !== UserRole.FINANCE) {
      return NextResponse.json(
        { error: "Forbidden: Only FINANCE can upload payment proofs" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!validateImageType(file.name)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, GIF, WEBP are allowed" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate file size (max 5MB)
    if (!validateFileSize(buffer, 5)) {
      return NextResponse.json(
        { error: "File size too large. Maximum 5MB" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const result = await uploadPaymentProof(buffer);

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
      message: "Payment proof uploaded successfully",
    });
  } catch (error: any) {
    console.error("Error uploading payment proof:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload payment proof" },
      { status: 500 }
    );
  }
}
