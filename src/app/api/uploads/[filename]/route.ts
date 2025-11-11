/**
 * Uploads Image Serve API Route
 * Endpoint untuk serve uploaded images
 */

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: Request,
  context: { params: { filename: string } }
) {
  try {
  const { params } = context;
  const filename = params.filename;

    // Security: Prevent directory traversal
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return NextResponse.json(
        { success: false, message: "Invalid filename" },
        { status: 400 }
      );
    }

    // Get file path
    const filepath = path.join(process.cwd(), "public", "uploads", filename);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return NextResponse.json(
        { success: false, message: "File not found" },
        { status: 404 }
      );
    }

    // Read file
    const file = fs.readFileSync(filepath);

    // Get file extension to set correct content type
    const ext = path.extname(filename).toLowerCase();
    let contentType = "image/jpeg";
    
    switch (ext) {
      case ".png":
        contentType = "image/png";
        break;
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".webp":
        contentType = "image/webp";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      default:
        contentType = "application/octet-stream";
    }

    // Return image with correct headers
    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to serve image",
      },
      { status: 500 }
    );
  }
}
