/**
 * Reimbursement Form Component
 * Form untuk STAFF submit reimbursement request
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadButton } from "@/components/shared/file-upload-button";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

// Form validation schema
const reimbursementFormSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Amount must be a positive number"
  ),
  description: z.string().min(10, "Description must be at least 10 characters"),
  expenseDate: z.string().min(1, "Expense date is required"),
  receiptUrl: z.string().url("Receipt is required"),
});

type ReimbursementFormValues = z.infer<typeof reimbursementFormSchema>;

interface Project {
  id: string;
  projectName: string;
  clientName: string;
  status: string;
}

interface ReimbursementFormProps {
  projects: Project[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReimbursementForm({ projects, onSuccess, onCancel }: ReimbursementFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [receiptPublicId, setReceiptPublicId] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ReimbursementFormValues>({
    resolver: zodResolver(reimbursementFormSchema),
    defaultValues: {
      projectId: "",
      amount: "",
      description: "",
      expenseDate: new Date().toISOString().split("T")[0], // Today's date
      receiptUrl: "",
    },
  });

  const projectId = watch("projectId");

  const onSubmit = async (data: ReimbursementFormValues) => {
    try {
      setIsSubmitting(true);

      const payload = {
        projectId: data.projectId,
        amount: Number(data.amount),
        description: data.description,
        expenseDate: new Date(data.expenseDate).toISOString(),
        receiptUrl: data.receiptUrl,
      };

      const response = await fetch("/api/staff/reimbursements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit reimbursement");
      }

      const result = await response.json();

      toast.success("Reimbursement submitted successfully");
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard/staff/reimbursements");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Failed to submit reimbursement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReceiptUpload = (url: string, publicId: string) => {
    setReceiptUrl(url);
    setReceiptPublicId(publicId);
    setValue("receiptUrl", url, { shouldValidate: true });
  };

  const handleRemoveReceipt = () => {
    setReceiptUrl("");
    setReceiptPublicId("");
    setValue("receiptUrl", "");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Reimbursement Request</CardTitle>
        <CardDescription>
          Fill in the details of your expense to request reimbursement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="projectId">
              Project <span className="text-red-500">*</span>
            </Label>
            <Select
              value={projectId}
              onValueChange={(value) => setValue("projectId", value, { shouldValidate: true })}
              disabled={isSubmitting}
            >
              <SelectTrigger id="projectId">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.projectName} - {project.clientName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.projectId && (
              <p className="text-sm text-red-500">{errors.projectId.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount (IDR) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="1000000"
              {...register("amount")}
              disabled={isSubmitting}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Expense Date */}
          <div className="space-y-2">
            <Label htmlFor="expenseDate">
              Expense Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="expenseDate"
              type="date"
              {...register("expenseDate")}
              disabled={isSubmitting}
              max={new Date().toISOString().split("T")[0]} // Can't select future dates
            />
            {errors.expenseDate && (
              <p className="text-sm text-red-500">{errors.expenseDate.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your expense in detail (min. 10 characters)"
              rows={4}
              {...register("description")}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Receipt Upload */}
          <div className="space-y-2">
            <Label>
              Receipt <span className="text-red-500">*</span>
            </Label>
            <FileUploadButton
              type="receipt"
              onUploadSuccess={handleReceiptUpload}
              currentFileUrl={receiptUrl}
              onRemoveFile={handleRemoveReceipt}
              disabled={isSubmitting}
              maxSizeMB={5}
            />
            {errors.receiptUrl && (
              <p className="text-sm text-red-500">{errors.receiptUrl.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
