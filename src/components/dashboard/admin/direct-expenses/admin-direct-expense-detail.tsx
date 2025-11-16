/**
 * Admin Direct Expense Detail Component
 * Detail dengan action approve/reject untuk direct expense
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { ExpenseTimeline } from "@/components/shared/expense-timeline";
import { ArrowLeft, Eye, CheckCircle, XCircle, FileText } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { DirectExpenseStatus } from "@/server/schema/enums";

export function AdminDirectExpenseDetail({ id }: { id: string }) {
  const router = useRouter();
  const [directExpense, setDirectExpense] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDirectExpense();
  }, [id]);

  const fetchDirectExpense = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/direct-expenses/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Direct expense not found");
          router.push("/dashboard/admin/direct-expenses");
          return;
        }
        throw new Error("Failed to fetch direct expense");
      }

      const data = await response.json();
      setDirectExpense(data);
    } catch (error: any) {
      console.error("Error fetching direct expense:", error);
      toast.error(error.message || "Failed to load direct expense");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/direct-expenses/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalNotes }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to approve direct expense");
      }

      toast.success("Direct expense approved successfully");
      setIsApproveDialogOpen(false);
      fetchDirectExpense();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve direct expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/direct-expenses/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reject direct expense");
      }

      toast.success("Direct expense rejected");
      setIsRejectDialogOpen(false);
      fetchDirectExpense();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject direct expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!directExpense) {
    return null;
  }

  const canApprove = directExpense.status === DirectExpenseStatus.PENDING;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/direct-expenses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Direct Expense Detail</h1>
            <p className="text-muted-foreground">Review and approve direct expense request</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge type="directExpense" status={directExpense.status} />
          {canApprove && (
            <>
              <Button onClick={() => setIsApproveDialogOpen(true)} variant="default">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button onClick={() => setIsRejectDialogOpen(true)} variant="destructive">
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(directExpense.amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expense Date</p>
                  <p className="text-lg font-medium">
                    {format(new Date(directExpense.expenseDate), "dd MMMM yyyy")}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Created By</p>
                <p className="font-medium">{directExpense.createdBy.name}</p>
                <p className="text-sm text-muted-foreground">{directExpense.createdBy.email}</p>
                <p className="text-xs text-muted-foreground mt-1">Role: {directExpense.createdBy.role}</p>
              </div>

              {directExpense.project && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Project</p>
                  <p className="font-medium">{directExpense.project.projectName}</p>
                  <p className="text-sm text-muted-foreground">
                    {directExpense.project.clientName}
                  </p>
                  {directExpense.project.projectValue && (
                    <p className="text-sm text-muted-foreground">
                      Budget: {formatCurrency(directExpense.project.projectValue)}
                    </p>
                  )}
                </div>
              )}

              {directExpense.category && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="font-medium">{directExpense.category.name}</p>
                  {directExpense.category.description && (
                    <p className="text-sm text-muted-foreground">{directExpense.category.description}</p>
                  )}
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-sm leading-relaxed">{directExpense.description}</p>
              </div>

              {directExpense.invoiceUrl && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Invoice/Receipt</p>
                  <a
                    href={directExpense.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    View Invoice
                  </a>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground">Submitted At</p>
                <p className="text-sm">{format(new Date(directExpense.createdAt), "dd MMMM yyyy HH:mm")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Approval Info */}
          {directExpense.approvedBy && (
            <Card className="border-green-200 dark:border-green-900">
              <CardHeader>
                <CardTitle className="text-green-600 dark:text-green-400">Approval Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved By</p>
                  <p className="font-medium">{directExpense.approvedBy.name}</p>
                  <p className="text-sm text-muted-foreground">{directExpense.approvedBy.email}</p>
                </div>
                {directExpense.approvedAt && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approved At</p>
                    <p className="text-sm">{format(new Date(directExpense.approvedAt), "dd MMMM yyyy HH:mm")}</p>
                  </div>
                )}
                {directExpense.approvalNotes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approval Notes</p>
                    <p className="text-sm">{directExpense.approvalNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Rejection Info */}
          {directExpense.rejectionReason && (
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">Rejection Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {directExpense.rejectedAt && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rejected At</p>
                    <p className="text-sm">{format(new Date(directExpense.rejectedAt), "dd MMMM yyyy HH:mm")}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reason</p>
                  <p className="text-sm">{directExpense.rejectionReason}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Info */}
          {directExpense.paidBy && (
            <Card className="border-purple-200 dark:border-purple-900">
              <CardHeader>
                <CardTitle className="text-purple-600 dark:text-purple-400">Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paid By</p>
                  <p className="font-medium">{directExpense.paidBy.name}</p>
                  <p className="text-sm text-muted-foreground">{directExpense.paidBy.email}</p>
                </div>
                {directExpense.paidAt && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Paid At</p>
                    <p className="text-sm">{format(new Date(directExpense.paidAt), "dd MMMM yyyy HH:mm")}</p>
                  </div>
                )}
                {directExpense.paymentDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment Date</p>
                    <p className="text-sm">{format(new Date(directExpense.paymentDate), "dd MMMM yyyy")}</p>
                  </div>
                )}
                {directExpense.paymentNotes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment Notes</p>
                    <p className="text-sm">{directExpense.paymentNotes}</p>
                  </div>
                )}
                {directExpense.paymentProofUrl && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Payment Proof</p>
                    <a
                      href={directExpense.paymentProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Eye className="h-4 w-4" />
                      View Payment Proof
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timeline */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseTimeline
                type="directExpense"
                status={directExpense.status}
                createdAt={new Date(directExpense.createdAt)}
                createdBy={directExpense.createdBy?.name}
                approvedAt={directExpense.approvedAt ? new Date(directExpense.approvedAt) : null}
                approvedBy={directExpense.approvedBy?.name}
                paidAt={directExpense.paidAt ? new Date(directExpense.paidAt) : null}
                paidBy={directExpense.paidBy?.name}
                rejectionReason={directExpense.rejectionReason}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Direct Expense</DialogTitle>
            <DialogDescription>
              Approve this direct expense and forward to finance for payment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Approval Notes (Optional)</Label>
              <Textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add any notes about this approval..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Confirm Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Direct Expense</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this direct expense
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rejection Reason *</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this is being rejected..."
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={isSubmitting || !rejectionReason.trim()}
            >
              {isSubmitting ? "Processing..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
