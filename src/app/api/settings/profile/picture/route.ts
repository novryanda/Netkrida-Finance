
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { settingsService } from "@/server/service/settings/settings.service";
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_URL?.split('@')[1] || "",
  api_key: process.env.CLOUDINARY_URL?.split('//')[1]?.split(':')[0] || "",
  api_secret: process.env.CLOUDINARY_URL?.split(':')[2]?.split('@')[0] || "",
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }
    // Convert file to buffer
    const arrayBuffer = await (file as Blob).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // Upload to Cloudinary with preset 'joki'
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "profile_pictures",
          resource_type: "image",
          upload_preset: "joki",
        },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });
    // @ts-ignore
    const url = uploadResult.secure_url;
    // @ts-ignore
    const public_id = uploadResult.public_id;
    // Update user profile with image and public_id
    await settingsService.updateProfile(session.user.id, { image: url, imagePublicId: public_id });
    return NextResponse.json({ success: true, url, public_id });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Accept public_id from body (JSON) or query param
    let public_id = null;
    if (req.method === "DELETE") {
      try {
        const body = await req.json();
        public_id = body.public_id;
      } catch {
        // fallback to query param
        public_id = req.nextUrl.searchParams.get("public_id");
      }
    }
    if (!public_id) {
      return NextResponse.json({ success: false, message: "public_id is required" }, { status: 400 });
    }
    await cloudinary.uploader.destroy(public_id, { resource_type: "image" });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Delete failed" }, { status: 500 });
  }
}
