/**
 * Finance Direct Expense Form Component
 * Form untuk FINANCE create direct expense request
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadButton } from "@/components/shared/file-upload-button";
import { toast } from "sonner";
import { Loader2, Save, Plus } from "lucide-react";

// Form validation schema
const directExpenseFormSchema = z.object({
  projectId: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Category is required"),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Amount must be a positive number"
  ),
  description: z.string().min(10, "Description must be at least 10 characters"),
  expenseDate: z.string().min(1, "Expense date is required"),
  invoiceUrl: z.string().url("Invoice is required"),
});

// Category create schema
const categoryCreateSchema = z.object({
  name: z.string().min(3, "Category name must be at least 3 characters"),
  description: z.string().optional(),
});

type DirectExpenseFormValues = z.infer<typeof directExpenseFormSchema>;
type CategoryCreateValues = z.infer<typeof categoryCreateSchema>;

interface Project {
  id: string;
  projectName: string;
  clientName: string;
  status: string;
}

interface Category {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

interface DirectExpenseFormProps {
  projects: Project[];
  categories: Category[];
  onSuccess?: () => void;
  onCancel?: () => void;
  onCategoryCreated?: () => void;
}

export function DirectExpenseForm({
  projects,
  categories,
  onSuccess,
  onCancel,
  onCategoryCreated,
}: DirectExpenseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState("");
  const [invoicePublicId, setInvoicePublicId] = useState("");
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DirectExpenseFormValues>({
    resolver: zodResolver(directExpenseFormSchema),
    defaultValues: {
      projectId: undefined,
      categoryId: "",
      amount: "",
      description: "",
      expenseDate: new Date().toISOString().split("T")[0],
      invoiceUrl: "",
    },
  });

  const {
    register: registerCategory,
    handleSubmit: handleSubmitCategory,
    formState: { errors: categoryErrors },
    reset: resetCategory,
  } = useForm<CategoryCreateValues>({
    resolver: zodResolver(categoryCreateSchema),
  });

  const projectId = watch("projectId");
  const categoryId = watch("categoryId");

  const onSubmit = async (data: DirectExpenseFormValues) => {
    try {
      setIsSubmitting(true);

      const payload: any = {
        categoryId: data.categoryId,
        amount: Number(data.amount),
        description: data.description,
        expenseDate: new Date(data.expenseDate).toISOString(),
        invoiceUrl: data.invoiceUrl,
      };
      
      // Only include projectId if it's provided
      if (data.projectId) {
        payload.projectId = data.projectId;
      }

      const response = await fetch("/api/finance/direct-expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create direct expense");
      }

      toast.success("Direct expense created successfully");
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard/finance/direct-expenses");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Failed to create direct expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCreateCategory = async (data: CategoryCreateValues) => {
    try {
      setIsCreatingCategory(true);

      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create category");
      }

      const result = await response.json();

      toast.success("Category created successfully");
      setValue("categoryId", result.id, { shouldValidate: true });
      setIsCreateCategoryOpen(false);
      resetCategory();
      
      if (onCategoryCreated) {
        onCategoryCreated();
      }
    } catch (error: any) {
      console.error("Create category error:", error);
      toast.error(error.message || "Failed to create category");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleInvoiceUpload = (url: string, publicId: string) => {
    setInvoiceUrl(url);
    setInvoicePublicId(publicId);
    setValue("invoiceUrl", url, { shouldValidate: true });
  };

  const handleRemoveInvoice = () => {
    setInvoiceUrl("");
    setInvoicePublicId("");
    setValue("invoiceUrl", "");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Direct Expense</CardTitle>
        <CardDescription>
          Create a direct expense request that requires admin approval. Project is optional - expenses without a project will be tracked by category only.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="projectId">
              Project <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <Select
              value={projectId || "none"}
              onValueChange={(value) => {
                if (value === "none") {
                  setValue("projectId", undefined, { shouldValidate: true });
                } else {
                  setValue("projectId", value, { shouldValidate: true });
                }
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger id="projectId">
                <SelectValue placeholder="Select a project (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Project (General Expense)</SelectItem>
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
            <p className="text-xs text-muted-foreground">
              Leave empty for general expenses not tied to a specific project
            </p>
          </div>

          {/* Category Selection with Create Option */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="categoryId">
                Category <span className="text-red-500">*</span>
              </Label>
              <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                    <DialogDescription>
                      Add a new expense category on-the-fly
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitCategory(onCreateCategory)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryName">Category Name</Label>
                      <Input
                        id="categoryName"
                        {...registerCategory("name")}
                        placeholder="Transportation, Meals, etc."
                        disabled={isCreatingCategory}
                      />
                      {categoryErrors.name && (
                        <p className="text-sm text-red-500">{categoryErrors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoryDescription">Description (Optional)</Label>
                      <Textarea
                        id="categoryDescription"
                        {...registerCategory("description")}
                        placeholder="Brief description of this category"
                        rows={3}
                        disabled={isCreatingCategory}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateCategoryOpen(false)}
                        disabled={isCreatingCategory}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isCreatingCategory}>
                        {isCreatingCategory ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <Select
              value={categoryId}
              onValueChange={(value) => setValue("categoryId", value, { shouldValidate: true })}
              disabled={isSubmitting}
            >
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((cat) => cat.isActive)
                  .map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-red-500">{errors.categoryId.message}</p>
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
              max={new Date().toISOString().split("T")[0]}
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
              placeholder="Describe the expense in detail (min. 10 characters)"
              rows={4}
              {...register("description")}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Invoice Upload */}
          <div className="space-y-2">
            <Label>
              Invoice <span className="text-red-500">*</span>
            </Label>
            <FileUploadButton
              type="invoice"
              onUploadSuccess={handleInvoiceUpload}
              currentFileUrl={invoiceUrl}
              onRemoveFile={handleRemoveInvoice}
              disabled={isSubmitting}
              maxSizeMB={10}
            />
            {errors.invoiceUrl && (
              <p className="text-sm text-red-500">{errors.invoiceUrl.message}</p>
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
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Expense
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
