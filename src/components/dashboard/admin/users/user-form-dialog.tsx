"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole, UserRoleLabels } from "@/server/schema/enums";
import type { CreateUserInput, UpdateUserInput, UserResponse } from "@/server/schema";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateUserInput | UpdateUserInput) => Promise<void>;
  user?: UserResponse | null;
  mode: "create" | "edit";
}

export function UserFormDialog({
  open,
  onOpenChange,
  onSubmit,
  user,
  mode,
}: UserFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateUserInput | UpdateUserInput>({
    name: "",
    email: "",
    password: "",
    role: UserRole.STAFF,
    bankName: "",
    bankAccountNo: "",
    isActive: true,
  });

  useEffect(() => {
    if (mode === "edit" && user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role,
        bankName: user.bankName || "",
        bankAccountNo: user.bankAccountNo || "",
        isActive: user.isActive,
      });
    } else if (mode === "create") {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: UserRole.STAFF,
        bankName: "",
        bankAccountNo: "",
        isActive: true,
      });
    }
  }, [mode, user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create New User" : "Edit User"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Add a new user to the system."
                : "Update user information."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">
                Password {mode === "create" && "*"}
              </Label>
              <Input
                id="password"
                type="password"
                value={(formData as CreateUserInput).password || ""}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={mode === "create"}
                placeholder={mode === "edit" ? "Leave blank to keep current" : ""}
              />
              {mode === "create" && (
                <p className="text-sm text-muted-foreground">
                  Minimum 8 characters
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, role: value as UserRole })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(UserRole).map((role) => (
                    <SelectItem key={role} value={role}>
                      {UserRoleLabels[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={formData.bankName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, bankName: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bankAccountNo">Bank Account Number</Label>
              <Input
                id="bankAccountNo"
                value={formData.bankAccountNo || ""}
                onChange={(e) =>
                  setFormData({ ...formData, bankAccountNo: e.target.value })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : mode === "create" ? "Create" : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
