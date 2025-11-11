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
import { Loader2 } from "lucide-react";

interface UpdateValueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    projectName: string;
    projectValue: string | number;
  } | null;
  onSubmit: (data: { newValue: number; reason: string }) => Promise<void>;
}

export function UpdateValueDialog({
  open,
  onOpenChange,
  project,
  onSubmit,
}: UpdateValueDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    newValue: "",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSubmit({
        newValue: parseFloat(formData.newValue),
        reason: formData.reason,
      });
      onOpenChange(false);
      setFormData({ newValue: "", reason: "" });
    } catch (error) {
      console.error("Error updating value:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Project Value</DialogTitle>
          <DialogDescription>
            Update the value for project: {project.projectName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Value</Label>
            <div className="p-3 bg-muted rounded-md font-semibold">
              Rp {Number(project.projectValue).toLocaleString("id-ID")}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newValue">
              New Value (Rp) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="newValue"
              type="number"
              step="0.01"
              min="0"
              value={formData.newValue}
              onChange={(e) =>
                setFormData({ ...formData, newValue: e.target.value })
              }
              required
              placeholder="Enter new project value"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for Change <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="reason"
              className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              required
              minLength={10}
              placeholder="Explain why the project value needs to be changed (minimum 10 characters)"
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
              Update Value
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
