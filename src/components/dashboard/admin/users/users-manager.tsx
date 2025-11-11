"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersCards } from "./users-cards";
import { UserFormDialog } from "./user-form-dialog";
import { UsersFilters } from "./users-filters";
import { Plus, RefreshCw } from "lucide-react";
import type { CreateUserInput, UpdateUserInput, UserResponse } from "@/server/schema";
import {toast} from "sonner"

export function UsersManager() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  // Filters
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [isActive, setIsActive] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(role !== "all" && { role }),
        ...(isActive !== "all" && { isActive }),
      });
      const response = await fetch(`/api/admin/users?${params}`);
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
        setTotalPages(result.pagination.totalPages);
      } else {
        toast(result.error || "Failed to fetch users", { description: "", });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast("Failed to fetch users", { description: "",  });
    } finally {
      setLoading(false);
    }
  }, [page, search, role, isActive, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (data: CreateUserInput | UpdateUserInput) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        toast("User created successfully");
        fetchUsers();
      } else {
        toast(result.error || "Failed to create user", { description: "",  });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast("Failed to create user", { description: "",  });
    }
  };

  const handleUpdateUser = async (data: CreateUserInput | UpdateUserInput) => {
    if (!selectedUser) return;
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        toast("User updated successfully");
        fetchUsers();
      } else {
        toast(result.error || "Failed to update user", { description: "",  });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast("Failed to update user", { description: "",  });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        toast("User deleted successfully");
        fetchUsers();
      } else {
        toast(result.error || "Failed to delete user", { description: "",  });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast("Failed to delete user", { description: "",  });
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: "POST",
      });
      const result = await response.json();
      if (result.success) {
        toast(result.message);
        fetchUsers();
      } else {
        toast(result.error || "Failed to toggle user status", { description: "",  });
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast("Failed to toggle user status", { description: "",  });
    }
  };

  const handleEdit = (user: UserResponse) => {
    setSelectedUser(user);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage system users, roles, and permissions
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter users by role, status, or search</CardDescription>
        </CardHeader>
        <CardContent>
          <UsersFilters
            search={search}
            onSearchChange={setSearch}
            role={role}
            onRoleChange={setRole}
            isActive={isActive}
            onIsActiveChange={setIsActive}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>
            {users.length} user(s) found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="p-4 sm:p-0">
              <UsersCards
                users={users}
                onEdit={handleEdit}
                onDelete={handleDeleteUser}
                onToggleStatus={handleToggleStatus}
              />
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={dialogMode === "create" ? handleCreateUser : handleUpdateUser}
        user={selectedUser}
        mode={dialogMode}
      />
    </div>
  );
}
