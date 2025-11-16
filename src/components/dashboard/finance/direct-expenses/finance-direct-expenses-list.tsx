/**
 * Finance Direct Expenses List Component
 * List direct expenses dengan data fetching
 */

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { Plus, Search, Eye, Clock, CheckCircle, TrendingUp, DollarSign } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

interface Statistics {
  total: number;
  pending: number;
  approved: number;
  paid: number;
  totalAmount: number;
}

interface DirectExpenseData {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function FinanceDirectExpensesList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expenses, setExpenses] = useState<DirectExpenseData | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentView = searchParams.get("view") || "all"; // 'all' or 'to_pay'

  useEffect(() => {
    fetchExpenses();
  }, [currentView, currentStatus, currentSearch, currentPage]); // More specific dependencies

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      // Add pagination
      params.set("page", currentPage.toString());
      params.set("limit", "20");
      
      // Add type parameter for approved expenses
      if (currentView === "to_pay") {
        params.set("type", "to_pay");
      } else {
        // For "all" view, add status filter if exists
        if (currentStatus && currentStatus !== "ALL") {
          params.set("status", currentStatus);
        }
      }
      
      // Add search if exists
      if (currentSearch) {
        params.set("search", currentSearch);
      }
      
      const response = await fetch(`/api/finance/direct-expenses?${params.toString()}`);
      
      if (response.status === 404) {
        setExpenses({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch direct expenses");
      }

      const result = await response.json();
      // Repository returns { directExpenses: [], pagination: {} }
      // Transform to { data: [], pagination: {} }
      console.log('[Direct Expenses] API Response:', {
        view: currentView,
        type: currentView === "to_pay" ? "to_pay" : "all",
        count: result.directExpenses?.length || 0,
        total: result.pagination?.total || 0
      });
      
      setExpenses({
        data: result.directExpenses || [],
        pagination: result.pagination
      });
    } catch (error: any) {
      console.error("Error fetching direct expenses:", error);
      toast.error(error.message || "Failed to load direct expenses");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setIsLoadingStats(true);
      const response = await fetch("/api/finance/direct-expenses/statistics");
      
      if (response.status === 404) {
        setStatistics({ total: 0, pending: 0, approved: 0, paid: 0, totalAmount: 0 });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const data = await response.json();
      setStatistics(data);
    } catch (error: any) {
      console.error("Error fetching statistics:", error);
      setStatistics({ total: 0, pending: 0, approved: 0, paid: 0, totalAmount: 0 });
    } finally {
      setIsLoadingStats(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Direct Expenses</h1>
          <p className="text-muted-foreground">
            Create and manage direct expenses for projects
          </p>
        </div>
        <Link href="/dashboard/finance/direct-expenses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Expense
          </Button>
        </Link>
      </div>

      {/* View Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              variant={currentView === "all" ? "default" : "outline"}
              onClick={() => updateSearchParams("view", "all")}
              className="flex-1"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              All Expenses
            </Button>
            <Button
              variant={currentView === "to_pay" ? "default" : "outline"}
              onClick={() => updateSearchParams("view", "to_pay")}
              className="flex-1"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              To Pay ({statistics?.approved || 0})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {isLoadingStats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : statistics ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{statistics.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paid</p>
                  <p className="text-2xl font-bold">{statistics.paid}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-bold">{formatCurrency(statistics.totalAmount)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-indigo-500" />
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
                  placeholder="Search expenses..."
                  value={currentSearch}
                  onChange={(e) => updateSearchParams("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {currentView === "all" && (
              <Select value={currentStatus} onValueChange={(value) => updateSearchParams("status", value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            )}
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
      ) : Array.isArray(expenses?.data) && expenses.data.length > 0 ? (
        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.data.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {format(new Date(expense.expenseDate), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {expense.description}
                    </TableCell>
                    <TableCell>
                      {expense.project?.projectName || "-"}
                    </TableCell>
                    <TableCell>
                      {expense.category?.name || "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge type="directExpense" status={expense.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/finance/direct-expenses/${expense.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {expense.status === "APPROVED" && (
                          <Link href={`/dashboard/finance/direct-expenses/${expense.id}`}>
                            <Button variant="default" size="sm">
                              <DollarSign className="h-4 w-4 mr-1" />
                              Pay
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {expenses.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * expenses.pagination.limit) + 1} to{" "}
                  {Math.min(currentPage * expenses.pagination.limit, expenses.pagination.total)} of{" "}
                  {expenses.pagination.total} results
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
                    disabled={currentPage === expenses.pagination.totalPages}
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
            <p className="text-muted-foreground">
              {currentView === "to_pay" 
                ? "No approved expenses ready for payment" 
                : "No direct expenses found"}
            </p>
            {currentView === "to_pay" && (
              <p className="text-sm text-muted-foreground mt-2">
                Approved direct expenses will appear here for payment processing
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
