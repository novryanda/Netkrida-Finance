/**
 * Finance Reimbursement Detail Component
 * Detail dengan action review/reject/pay
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
import { FileUploadButton } from "@/components/shared/file-upload-button";
import { ArrowLeft, Eye, CheckCircle, XCircle, DollarSign } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { ReimbursementStatus } from "@/server/schema/enums";

export function FinanceReimbursementDetail({ id }: { id: string }) {
  const router = useRouter();
  const [reimbursement, setReimbursement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReimbursement();
  }, [id]);

  const fetchReimbursement = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/finance/reimbursements/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Reimbursement not found");
          router.push("/dashboard/finance/reimbursements");
          return;
        }
        throw new Error("Failed to fetch reimbursement");
      }

      const data = await response.json();
      setReimbursement(data);
    } catch (error: any) {
      console.error("Error fetching reimbursement:", error);
      toast.error(error.message || "Failed to load reimbursement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/finance/reimbursements/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewNotes }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to review reimbursement");
      }

      toast.success("Reimbursement reviewed successfully");
      setIsReviewDialogOpen(false);
      fetchReimbursement();
    } catch (error: any) {
      toast.error(error.message || "Failed to review reimbursement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/finance/reimbursements/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reject reimbursement");
      }

      toast.success("Reimbursement rejected");
      setIsRejectDialogOpen(false);
      fetchReimbursement();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject reimbursement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePay = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/finance/reimbursements/${id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          paymentProofUrl,
          paymentNotes 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to mark as paid");
      }

      toast.success("Payment recorded successfully");
      setIsPayDialogOpen(false);
      fetchReimbursement();
    } catch (error: any) {
      toast.error(error.message || "Failed to record payment");
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

  if (!reimbursement) {
    return null;
  }

  const canReview = reimbursement.status === ReimbursementStatus.PENDING;
  const canPay = reimbursement.status === ReimbursementStatus.APPROVED;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/finance/reimbursements">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reimbursement Detail</h1>
            <p className="text-muted-foreground">Review and process reimbursement request</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge type="reimbursement" status={reimbursement.status} />
          {canReview && (
            <>
              <Button onClick={() => setIsReviewDialogOpen(true)} variant="default">
                <CheckCircle className="h-4 w-4 mr-2" />
                Review
              </Button>
              <Button onClick={() => setIsRejectDialogOpen(true)} variant="destructive">
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          {canPay && (
            <Button onClick={() => setIsPayDialogOpen(true)} variant="default">
              <DollarSign className="h-4 w-4 mr-2" />
              Mark as Paid
            </Button>
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
                  <p className="text-2xl font-bold">{formatCurrency(reimbursement.amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expense Date</p>
                  <p className="text-lg font-medium">
                    {format(new Date(reimbursement.expenseDate), "dd MMMM yyyy")}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Staff</p>
                <p className="font-medium">{reimbursement.submittedBy.name}</p>
                <p className="text-sm text-muted-foreground">{reimbursement.submittedBy.email}</p>
              </div>

              {reimbursement.project && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Project</p>
                  <p className="font-medium">{reimbursement.project.projectName}</p>
                  <p className="text-sm text-muted-foreground">
                    {reimbursement.project.clientName}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-sm leading-relaxed">{reimbursement.description}</p>
              </div>

              {reimbursement.receiptUrl && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Receipt</p>
                  <a
                    href={reimbursement.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Eye className="h-4 w-4" />
                    View Receipt
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {reimbursement.rejectionReason && (
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">Rejection Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{reimbursement.rejectionReason}</p>
              </CardContent>
            </Card>
          )}

          {/* Payment Proof */}
          {reimbursement.paymentProofUrl && (
            <Card className="border-green-200 dark:border-green-900">
              <CardHeader>
                <CardTitle className="text-green-600 dark:text-green-400">Payment Proof</CardTitle>
                <CardDescription>
                  Paid on {format(new Date(reimbursement.paidAt!), "dd MMMM yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={reimbursement.paymentProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Eye className="h-4 w-4" />
                  View Payment Proof
                </a>
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
                type="reimbursement"
                status={reimbursement.status}
                submittedAt={new Date(reimbursement.submittedAt)}
                submittedBy={reimbursement.submittedBy?.name}
                reviewedAt={reimbursement.reviewedAt ? new Date(reimbursement.reviewedAt) : null}
                reviewedBy={reimbursement.reviewedBy?.name}
                approvedAt={reimbursement.approvedAt ? new Date(reimbursement.approvedAt) : null}
                approvedBy={reimbursement.approvedBy?.name}
                paidAt={reimbursement.paidAt ? new Date(reimbursement.paidAt) : null}
                paidBy={reimbursement.paidBy?.name}
                rejectionReason={reimbursement.rejectionReason}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Reimbursement</DialogTitle>
            <DialogDescription>
              Mark this reimbursement as reviewed and forward to admin for approval
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Review Notes (Optional)</Label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any notes about this review..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReview} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Confirm Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Reimbursement</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this reimbursement
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

      {/* Pay Dialog */}
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Paid</DialogTitle>
            <DialogDescription>
              Upload payment proof and mark this reimbursement as paid
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Payment Proof *</Label>
              <FileUploadButton
                type="payment-proof"
                onUploadSuccess={(url) => setPaymentProofUrl(url)}
                currentFileUrl={paymentProofUrl}
                onRemoveFile={() => setPaymentProofUrl("")}
                maxSizeMB={10}
              />
            </div>
            <div>
              <Label>Payment Notes (Optional)</Label>
              <Textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Add any notes about the payment..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPayDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePay} 
              disabled={isSubmitting || !paymentProofUrl}
            >
              {isSubmitting ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
