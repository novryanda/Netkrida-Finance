/**
 * Finance Direct Expense Detail Component
 * Detail direct expense dengan action pay
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Eye, DollarSign } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { DirectExpenseStatus } from "@/server/schema/enums";

export function FinanceDirectExpenseDetail({ id }: { id: string }) {
  const router = useRouter();
  const [expense, setExpense] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchExpense();
  }, [id]);

  const fetchExpense = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/finance/direct-expenses/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Direct expense not found");
          router.push("/dashboard/finance/direct-expenses");
          return;
        }
        throw new Error("Failed to fetch direct expense");
      }

      const data = await response.json();
      setExpense(data);
    } catch (error: any) {
      console.error("Error fetching direct expense:", error);
      toast.error(error.message || "Failed to load direct expense");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/finance/direct-expenses/${id}/pay`, {
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
      fetchExpense();
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

  if (!expense) {
    return null;
  }

  const canPay = expense.status === DirectExpenseStatus.APPROVED;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/finance/direct-expenses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Direct Expense Detail</h1>
            <p className="text-muted-foreground">View and process direct expense</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge type="directExpense" status={expense.status} />
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
                  <p className="text-2xl font-bold">{formatCurrency(expense.amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expense Date</p>
                  <p className="text-lg font-medium">
                    {format(new Date(expense.expenseDate), "dd MMMM yyyy")}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Created By</p>
                <p className="font-medium">{expense.createdBy.name}</p>
                <p className="text-sm text-muted-foreground">{expense.createdBy.email}</p>
              </div>

              {expense.project && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Project</p>
                  <p className="font-medium">{expense.project.projectName}</p>
                  <p className="text-sm text-muted-foreground">
                    {expense.project.clientName}
                  </p>
                </div>
              )}

              {expense.category && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="font-medium">{expense.category.name}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-sm leading-relaxed">{expense.description}</p>
              </div>

              {expense.invoiceUrl && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Invoice</p>
                  <a
                    href={expense.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Eye className="h-4 w-4" />
                    View Invoice
                  </a>
                </div>
              )}

              {expense.paymentProofUrl && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Payment Proof</p>
                  <a
                    href={expense.paymentProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Eye className="h-4 w-4" />
                    View Payment Proof
                  </a>
                </div>
              )}

              {expense.paymentNotes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Payment Notes</p>
                  <p className="text-sm leading-relaxed">{expense.paymentNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {expense.rejectionReason && (
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">Rejection Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{expense.rejectionReason}</p>
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
                status={expense.status}
                createdAt={new Date(expense.createdAt)}
                createdBy={expense.createdBy?.name}
                approvedAt={expense.approvedAt ? new Date(expense.approvedAt) : null}
                approvedBy={expense.approvedBy?.name}
                paidAt={expense.paidAt ? new Date(expense.paidAt) : null}
                paidBy={expense.paidBy?.name}
                rejectionReason={expense.rejectionReason}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pay Dialog */}
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Paid</DialogTitle>
            <DialogDescription>
              Upload payment proof and mark this direct expense as paid
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
