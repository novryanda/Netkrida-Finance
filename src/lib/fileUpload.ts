/**
 * File Upload Utility
 * Handle file uploads to Cloudinary
 */

const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_URL?.split("@")[1] || "",
  api_key: process.env.CLOUDINARY_URL?.split("//")[1]?.split(":")[0] || "",
  api_secret: process.env.CLOUDINARY_URL?.split(":")[2]?.split("@")[0] || "",
});

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  resourceType: string;
}

/**
 * Upload file to Cloudinary
 * @param file File buffer or base64 string
 * @param folder Folder name in Cloudinary
 * @param resourceType Type of resource (image, raw, video, auto)
 * @returns Upload result with URL and public ID
 */
export async function uploadFile(
  file: Buffer | string,
  folder: string = "finance",
  resourceType: "image" | "raw" | "video" | "auto" = "auto"
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        upload_preset: "joki", // Use existing preset
      },
      (error: any, result: any) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(new Error("Failed to upload file"));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            resourceType: result.resource_type,
          });
        }
      }
    );

    // Handle different input types
    if (Buffer.isBuffer(file)) {
      uploadStream.end(file);
    } else if (typeof file === "string") {
      // Base64 string
      const buffer = Buffer.from(file, "base64");
      uploadStream.end(buffer);
    } else {
      reject(new Error("Invalid file format"));
    }
  });
}

/**
 * Upload receipt/invoice image
 */
export async function uploadReceipt(file: Buffer | string): Promise<UploadResult> {
  return uploadFile(file, "finance/receipts", "image");
}

/**
 * Upload invoice document
 */
export async function uploadInvoice(file: Buffer | string): Promise<UploadResult> {
  return uploadFile(file, "finance/invoices", "auto");
}

/**
 * Upload payment proof
 */
export async function uploadPaymentProof(file: Buffer | string): Promise<UploadResult> {
  return uploadFile(file, "finance/payments", "image");
}

/**
 * Delete file from Cloudinary
 * @param publicId Public ID of the file
 * @param resourceType Type of resource
 */
export async function deleteFile(
  publicId: string,
  resourceType: "image" | "raw" | "video" = "image"
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete file");
  }
}

/**
 * Get file URL by public ID
 */
export function getFileUrl(publicId: string): string {
  return cloudinary.url(publicId, { secure: true });
}

/**
 * Validate file size (max 5MB)
 */
export function validateFileSize(file: Buffer, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.length <= maxSizeBytes;
}

/**
 * Validate image file type
 */
export function validateImageType(filename: string): boolean {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."));
  return allowedExtensions.includes(ext);
}

/**
 * Validate document file type
 * Accepts PDF and common image formats
 */
export function validateDocumentType(filename: string): boolean {
  const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif"];
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."));
  return allowedExtensions.includes(ext);
}
