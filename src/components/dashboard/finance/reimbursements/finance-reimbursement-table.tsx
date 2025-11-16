/**
 * Finance Reimbursement Review Table Component
 * Table untuk FINANCE review reimbursement requests
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReimbursementStatus } from "@/server/schema/enums";
import { format } from "date-fns";
import { Eye, Search, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";

interface Reimbursement {
  id: string;
  status: ReimbursementStatus;
  submittedAt: string;
  amount: string;
  description: string;
  expenseDate: string;
  submittedBy: {
    name: string;
    email: string;
  };
  project?: {
    projectName: string;
    clientName: string;
  };
}

interface FinanceReimbursementTableProps {
  data: Reimbursement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  showFilters?: boolean;
  onRowClick?: (id: string) => void;
  onReview?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function FinanceReimbursementTable({
  data,
  pagination,
  showFilters = true,
  onRowClick,
  onReview,
  onReject,
}: FinanceReimbursementTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");

  const updateFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    
    params.set("page", "1");
    
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleRowClick = (id: string) => {
    if (onRowClick) {
      onRowClick(id);
    } else {
      router.push(`/dashboard/finance/reimbursements/${id}`);
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reimbursement Review Queue</CardTitle>
        <CardDescription>
          Review and approve reimbursement requests from staff
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search by description or staff name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && updateFilters()}
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value={ReimbursementStatus.PENDING}>Pending Review</SelectItem>
                <SelectItem value={ReimbursementStatus.REVIEWED}>Reviewed</SelectItem>
                <SelectItem value={ReimbursementStatus.APPROVED}>Approved</SelectItem>
                <SelectItem value={ReimbursementStatus.PAID}>Paid</SelectItem>
                <SelectItem value={ReimbursementStatus.REJECTED}>Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={updateFilters}>
              <Search className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[140px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(data) && data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No reimbursements found
                  </TableCell>
                </TableRow>
              ) : Array.isArray(data) ? (
                data.map((reimbursement) => (
                  <TableRow
                    key={reimbursement.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(reimbursement.id)}
                  >
                    <TableCell className="font-medium">
                      {format(new Date(reimbursement.expenseDate), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{reimbursement.submittedBy.name}</p>
                        <p className="text-sm text-muted-foreground">{reimbursement.submittedBy.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {reimbursement.project ? (
                        <div>
                          <p className="font-medium">{reimbursement.project.projectName}</p>
                          <p className="text-sm text-muted-foreground">
                            {reimbursement.project.clientName}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {reimbursement.description}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(reimbursement.amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge type="reimbursement" status={reimbursement.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(reimbursement.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {reimbursement.status === ReimbursementStatus.PENDING && onReview && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              onReview(reimbursement.id);
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {reimbursement.status === ReimbursementStatus.PENDING && onReject && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              onReject(reimbursement.id);
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : null}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{" "}
              results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
