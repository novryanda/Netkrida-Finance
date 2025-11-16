/**
 * Reimbursement Table Component
 * Table dengan filters dan pagination untuk reimbursements
 */

"use client";

import { useState, useEffect } from "react";
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
import { Eye, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Reimbursement {
  id: string;
  status: ReimbursementStatus;
  submittedAt: string;
  amount: number | string;
  description: string;
  expenseDate: string;
  project?: {
    projectName: string;
    clientName: string;
  };
}


export function ReimbursementTable(props: { showFilters?: boolean; onRowClick?: (id: string) => void } = {}) {
  const { showFilters = true, onRowClick } = props;
  const router = useRouter();
  const searchParams = useSearchParams();
  

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [limit] = useState(10); // default page size
  const [data, setData] = useState<Reimbursement[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(false);


  // Fetch reimbursements from API
  const fetchReimbursements = async (paramsObj?: {search?: string; status?: string; page?: number; limit?: number}) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (paramsObj?.search) params.set("search", paramsObj.search);
      if (paramsObj?.status && paramsObj.status !== "ALL") params.set("status", paramsObj.status);
      if (paramsObj?.page) params.set("page", paramsObj.page.toString());
      if (paramsObj?.limit) params.set("limit", paramsObj.limit.toString());
      const res = await fetch(`/api/staff/reimbursements?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch reimbursements");
      const json = await res.json();
      setData(json.reimbursements || []);
      setPagination(json.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      setData([]);
      setPagination({ page: 1, limit: 10, total: 0, totalPages: 1 });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and on param change
  useEffect(() => {
    fetchReimbursements({ search, status, page, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, page]);

  const updateFilters = () => {
    setPage(1);
    fetchReimbursements({ search, status, page: 1, limit });
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
    setPage(newPage);
    fetchReimbursements({ search, status, page: newPage, limit });
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleRowClick = (id: string) => {
    if (onRowClick) {
      onRowClick(id);
    } else {
      router.push(`/dashboard/staff/reimbursements/${id}`);
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
        <CardTitle>Reimbursements</CardTitle>
        <CardDescription>
          View and manage your reimbursement requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search by description..."
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
                <SelectItem value={ReimbursementStatus.PENDING}>Pending</SelectItem>
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
        <div className="rounded-md border min-h-[200px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : Array.isArray(data) && data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
