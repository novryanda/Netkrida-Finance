"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectStatus } from "@/server/schema/enums";
import { Loader2 } from "lucide-react";

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  project?: {
    id: string;
    projectName: string;
    clientName: string;
    projectValue: string | number;
    deadline: Date | string;
    status: ProjectStatus;
    description: string | null;
  } | null;
  onSubmit: (data: any) => Promise<void>;
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  mode,
  project,
  onSubmit,
}: ProjectFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectName: project?.projectName || "",
    clientName: project?.clientName || "",
    projectValue: project?.projectValue?.toString() || "",
    deadline: project?.deadline
      ? new Date(project.deadline).toISOString().split("T")[0]
      : "",
    status: project?.status || ProjectStatus.ACTIVE,
    description: project?.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSubmit({
        ...formData,
        projectValue: parseFloat(formData.projectValue),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : new Date().toISOString(),
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Project" : "Edit Project"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the project details below"
              : "Update the project information"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">
                Project Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) =>
                  setFormData({ ...formData, projectName: e.target.value })
                }
                required
                placeholder="Enter project name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientName">
                Client Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) =>
                  setFormData({ ...formData, clientName: e.target.value })
                }
                required
                placeholder="Enter client name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectValue">
                Project Value (Rp) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="projectValue"
                type="number"
                step="0.01"
                min="0"
                value={formData.projectValue}
                onChange={(e) =>
                  setFormData({ ...formData, projectValue: e.target.value })
                }
                required
                placeholder="Enter project value"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">
                Deadline <span className="text-red-500">*</span>
              </Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value as ProjectStatus })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ProjectStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={ProjectStatus.ON_HOLD}>On Hold</SelectItem>
                <SelectItem value={ProjectStatus.COMPLETED}>
                  Completed
                </SelectItem>
                <SelectItem value={ProjectStatus.CANCELLED}>
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter project description (optional)"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Project" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
