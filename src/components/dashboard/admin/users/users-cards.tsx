import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Power, User2 } from "lucide-react";
import type { UserResponse } from "@/server/schema";
import { useState } from "react";

interface UsersCardsProps {
  users: UserResponse[];
  onEdit: (user: UserResponse) => void;
  onDelete: (userId: string) => void;
  onToggleStatus: (userId: string) => void;
}

export function UsersCards({ users, onEdit, onDelete, onToggleStatus }: UsersCardsProps) {
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string | null }>({ open: false, userId: null });
  const [loadingId, setLoadingId] = useState<string | null>(null);
  if (users.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No users found</div>;
  }
  const handleDelete = (userId: string) => {
    setDeleteDialog({ open: true, userId });
  };
  const confirmDelete = async () => {
    if (deleteDialog.userId) {
      setLoadingId(deleteDialog.userId);
      await onDelete(deleteDialog.userId);
      setLoadingId(null);
    }
    setDeleteDialog({ open: false, userId: null });
  };
  return (
    <>
      <AlertDialog open={deleteDialog.open} onOpenChange={open => setDeleteDialog({ open, userId: open ? deleteDialog.userId : null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialog({ open: false, userId: null })}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={confirmDelete} disabled={loadingId === deleteDialog.userId}>
                {loadingId === deleteDialog.userId ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="relative group overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              {/* Avatar with profile picture */}
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground overflow-hidden">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User2 className="h-6 w-6" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg line-clamp-1">{user.name}</CardTitle>
                <CardDescription className="line-clamp-1">{user.email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{user.role}</Badge>
                <Badge variant={user.isActive ? "default" : "secondary"}>{user.isActive ? "Active" : "Inactive"}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Bank: {user.bankName || "-"} <br />
                Account: {user.bankAccountNo || "-"}
              </div>
              <div className="text-xs text-muted-foreground">
                Created: {new Date(user.createdAt).toLocaleDateString()}
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="icon" variant="outline" onClick={() => onEdit(user)} title="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={() => onToggleStatus(user.id)} title={user.isActive ? "Deactivate" : "Activate"}>
                  <Power className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => handleDelete(user.id)} title="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
