/**
 * Staff Reimbursement Detail Component
 * Detail page dengan data fetching
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { ExpenseTimeline } from "@/components/shared/expense-timeline";
import { ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

interface ReimbursementDetail {
  id: string;
  status: any;
  submittedAt: string;
  submittedBy: { name: string };
  reviewedAt?: string | null;
  reviewedBy?: { name: string } | null;
  approvedAt?: string | null;
  approvedBy?: { name: string } | null;
  paidAt?: string | null;
  paidBy?: { name: string } | null;
  rejectionReason?: string | null;
  paymentProofUrl?: string | null;
  amount: string;
  description: string;
  expenseDate: string;
  receiptUrl?: string | null;
  project?: {
    projectName: string;
    clientName: string;
  };
  category?: {
    name: string;
  };
}

export function StaffReimbursementDetail({ id }: { id: string }) {
  const router = useRouter();
  const [reimbursement, setReimbursement] = useState<ReimbursementDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReimbursement();
  }, [id]);

  const fetchReimbursement = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/staff/reimbursements/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Reimbursement not found");
          router.push("/dashboard/staff/reimbursements");
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
        <div className="flex items-center gap-4">
          <Link href="/dashboard/staff/reimbursements">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/staff/reimbursements">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Reimbursement Detail</h1>
          <p className="text-muted-foreground">
            View details and track status of your reimbursement request
          </p>
        </div>
        <StatusBadge type="reimbursement" status={reimbursement.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Expense Details */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Information</CardTitle>
              <CardDescription>Details of your expense claim</CardDescription>
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

              {reimbursement.project && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Project</p>
                  <p className="font-medium">{reimbursement.project.projectName}</p>
                  <p className="text-sm text-muted-foreground">
                    {reimbursement.project.clientName}
                  </p>
                </div>
              )}

              {reimbursement.category && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="font-medium">{reimbursement.category.name}</p>
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

          {/* Rejection Reason */}
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

        {/* Timeline Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
              <CardDescription>Track your reimbursement progress</CardDescription>
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
    </div>
  );
}
