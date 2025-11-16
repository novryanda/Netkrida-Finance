/**
 * Admin Reimbursement Approvals Component
 * Queue approval untuk reimbursement
 */

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Search, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

interface Statistics {
  total: number;
  pending: number;
  reviewed: number;
  approved: number;
  paid: number;
  rejected: number;
  totalAmount: number;
}

interface ReimbursementData {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function AdminReimbursementApprovals() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reimbursements, setReimbursements] = useState<ReimbursementData | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedReimbursement, setSelectedReimbursement] = useState<any>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "";

  useEffect(() => {
    fetchReimbursements();
  }, [searchParams]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchReimbursements = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams(searchParams.toString());
      
      const response = await fetch(`/api/admin/reimbursements?${params.toString()}`);
      
      if (response.status === 404) {
        setReimbursements({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch reimbursements");
      }

      const result = await response.json();
      // Repository returns { reimbursements: [], pagination: {} }
      // Transform to { data: [], pagination: {} } for component
      setReimbursements({
        data: result.reimbursements || [],
        pagination: result.pagination
      });
    } catch (error: any) {
      console.error("Error fetching reimbursements:", error);
      toast.error(error.message || "Failed to load reimbursements");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setIsLoadingStats(true);
      const response = await fetch("/api/admin/reimbursements/statistics");
      
      if (response.status === 404) {
        setStatistics({ total: 0, pending: 0, reviewed: 0, approved: 0, paid: 0, rejected: 0, totalAmount: 0 });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const data = await response.json();
      setStatistics(data);
    } catch (error: any) {
      console.error("Error fetching statistics:", error);
      setStatistics({ total: 0, pending: 0, reviewed: 0, approved: 0, paid: 0, rejected: 0, totalAmount: 0 });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedReimbursement) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/reimbursements/${selectedReimbursement.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalNotes }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to approve reimbursement");
      }

      toast.success("Reimbursement approved successfully");
      setIsApproveDialogOpen(false);
      setSelectedReimbursement(null);
      setApprovalNotes("");
      fetchReimbursements();
      fetchStatistics();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve reimbursement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReimbursement) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/reimbursements/${selectedReimbursement.id}/reject`, {
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
      setSelectedReimbursement(null);
      setRejectionReason("");
      fetchReimbursements();
      fetchStatistics();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject reimbursement");
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

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
      if (key !== "page") {
        params.set("page", "1");
      }
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  const openApproveDialog = (reimbursement: any) => {
    setSelectedReimbursement(reimbursement);
    setIsApproveDialogOpen(true);
  };

  const openRejectDialog = (reimbursement: any) => {
    setSelectedReimbursement(reimbursement);
    setIsRejectDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reimbursement Approvals</h1>
          <p className="text-muted-foreground">
            Review and approve reimbursement requests
          </p>
        </div>
      </div>

      {/* Statistics */}
      {isLoadingStats ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : statistics ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">{statistics.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reviewed</p>
                  <p className="text-2xl font-bold">{statistics.reviewed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{statistics.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reimbursements..."
                  value={currentSearch}
                  onChange={(e) => updateSearchParams("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={currentStatus} onValueChange={(value) => updateSearchParams("status", value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REVIEWED">Reviewed</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : Array.isArray(reimbursements?.data) && reimbursements.data.length > 0 ? (
        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reimbursements.data.map((reimbursement) => (
                  <TableRow key={reimbursement.id}>
                    <TableCell>
                      {format(new Date(reimbursement.expenseDate), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{reimbursement.submittedBy.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {reimbursement.submittedBy.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {reimbursement.description}
                    </TableCell>
                    <TableCell>
                      {reimbursement.project?.projectName || "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(reimbursement.amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge type="reimbursement" status={reimbursement.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/admin/reimbursements/${reimbursement.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {reimbursement.status === "REVIEWED" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openApproveDialog(reimbursement)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openRejectDialog(reimbursement)}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {reimbursements.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * reimbursements.pagination.limit) + 1} to{" "}
                  {Math.min(currentPage * reimbursements.pagination.limit, reimbursements.pagination.total)} of{" "}
                  {reimbursements.pagination.total} results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSearchParams("page", String(currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSearchParams("page", String(currentPage + 1))}
                    disabled={currentPage === reimbursements.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No reimbursements found</p>
          </CardContent>
        </Card>
      )}

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Reimbursement</DialogTitle>
            <DialogDescription>
              Approve this reimbursement and forward to finance for payment
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
    </div>
  );
}
