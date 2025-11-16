/**
 * API Route: /api/upload/invoice
 * Upload invoice file
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import {
  uploadInvoice,
  validateFileSize,
  validateDocumentType,
} from "@/lib/fileUpload";
import { UserRole } from "@/server/schema/enums";

/**
 * POST /api/upload/invoice
 * Upload invoice document
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
        { error: "Forbidden: Only FINANCE can upload invoices" },
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
    if (!validateDocumentType(file.name)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, JPG, JPEG, PNG, WEBP, BMP, GIF are allowed" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate file size (max 10MB for documents)
    if (!validateFileSize(buffer, 10)) {
      return NextResponse.json(
        { error: "File size too large. Maximum 10MB" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const result = await uploadInvoice(buffer);

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
      message: "Invoice uploaded successfully",
    });
  } catch (error: any) {
    console.error("Error uploading invoice:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload invoice" },
      { status: 500 }
    );
  }
}
