/**
 * Profile Picture Upload Component
 * Component untuk upload dan manage profile picture
 */

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, X, User } from "lucide-react";

interface ProfilePictureUploadProps {
  currentImage: string | null;
  userName: string | null;
  currentPublicId?: string | null; // Tambahan jika backend sudah support
}

//
export function ProfilePictureUpload(props: ProfilePictureUploadProps) {
  const { currentImage, userName, currentPublicId = null } = props;
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage);
  const [publicId, setPublicId] = useState<string | null>(currentPublicId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only JPEG, PNG, and WebP are allowed");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size too large. Maximum size is 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file to Cloudinary via API
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/settings/profile/picture", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to upload profile picture");
      }

      setPreviewUrl(data.url || null);
      setPublicId(data.public_id || null);
      // Save image URL dan public_id ke user profile
      const saveRes = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: data.url, imagePublicId: data.public_id }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok || !saveData.success) {
        throw new Error(saveData.message || "Failed to save profile picture");
      }
      toast.success("Profile picture uploaded & saved");
      router.refresh();
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload profile picture"
      );
      // Reset preview on error
      setPreviewUrl(currentImage);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeletePicture = async () => {
    setIsDeleting(true);
    try {
      if (!publicId) {
        toast.error("public_id not found for this image");
        setIsDeleting(false);
        return;
      }
      // Hapus dari Cloudinary
      const response = await fetch("/api/settings/profile/picture", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: publicId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete profile picture");
      }
      // Clear image dan imagePublicId di user profile
      const saveRes = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: null, imagePublicId: null }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok || !saveData.success) {
        throw new Error(saveData.message || "Failed to clear profile picture");
      }
      toast.success("Profile picture deleted successfully");
      setPreviewUrl(null);
      setPublicId(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete profile picture"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {/* Preview */}
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-muted">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={userName || "Profile"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <User className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Upload/Delete Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isDeleting}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Picture
                </>
              )}
            </Button>

            {previewUrl && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeletePicture}
                disabled={isUploading || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Info */}
          <p className="text-center text-xs text-muted-foreground">
            Allowed formats: JPEG, PNG, WebP
            <br />
            Maximum size: 5MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
