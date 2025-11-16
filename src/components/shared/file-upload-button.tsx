/**
 * File Upload Button Component
 * Reusable component untuk upload file ke Cloudinary via API
 */

"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Loader2, File, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadButtonProps {
  type: "receipt" | "invoice" | "payment-proof";
  onUploadSuccess: (url: string, publicId: string) => void;
  onUploadError?: (error: string) => void;
  currentFileUrl?: string;
  onRemoveFile?: () => void;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * FileUploadButton Component
 * Upload file dengan preview dan progress
 */
export function FileUploadButton({
  type,
  onUploadSuccess,
  onUploadError,
  currentFileUrl,
  onRemoveFile,
  label,
  accept,
  maxSizeMB = 5,
  disabled = false,
  className,
}: FileUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default labels
  const defaultLabels = {
    receipt: "Upload Receipt",
    invoice: "Upload Invoice",
    "payment-proof": "Upload Payment Proof",
  };

  // Default accept types
  const defaultAccept = {
    receipt: "image/*,.pdf",
    invoice: "image/*,.pdf,application/pdf",
    "payment-proof": "image/*,.pdf",
  };

  const displayLabel = label || defaultLabels[type];
  const acceptTypes = accept || defaultAccept[type];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      const errorMsg = `File size must be less than ${maxSizeMB}MB`;
      toast.error(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
      return;
    }

    try {
      setIsUploading(true);

      // Create FormData
      const formData = new FormData();
      formData.append("file", file);

      // Upload to API
      const endpoint = `/api/upload/${type}`;
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      
      toast.success(`${displayLabel} uploaded successfully`);
      onUploadSuccess(data.url, data.publicId);
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMsg = error.message || "Failed to upload file";
      toast.error(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveFile = () => {
    if (onRemoveFile) {
      onRemoveFile();
      toast.success("File removed");
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptTypes}
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="hidden"
        />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="w-full sm:w-auto"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {displayLabel}
            </>
          )}
        </Button>

        {currentFileUrl && onRemoveFile && !isUploading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveFile}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* File Preview */}
      {currentFileUrl && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 p-2">
          <File className="h-4 w-4 text-muted-foreground" />
          <a
            href={currentFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline truncate flex-1"
          >
            View uploaded file
          </a>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        Max file size: {maxSizeMB}MB. Accepted: {acceptTypes}
      </p>
    </div>
  );
}
