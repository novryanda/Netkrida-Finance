/**
 * Finance Reimbursements List Component
 * Review queue dengan data fetching
 */

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FinanceReimbursementTable } from "./finance-reimbursement-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface Statistics {
  total: number;
  pending: number;
  reviewed: number;
  approved: number;
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

export function FinanceReimbursementsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [reimbursements, setReimbursements] = useState<ReimbursementData | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [view, setView] = useState<"all" | "to_pay">("all");

  useEffect(() => {
    fetchReimbursements();
  }, [searchParams, view]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchReimbursements = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams(searchParams.toString());
      
      // Add type parameter based on view
      if (view === "to_pay") {
        params.set("type", "to_pay");
        // Remove status filter when showing "To Pay" view
        params.delete("status");
      } else {
        params.delete("type");
      }
      
      console.log('[Frontend] Fetching reimbursements with view:', view, 'params:', params.toString());
      const response = await fetch(`/api/finance/reimbursements?${params.toString()}`);
      
      if (response.status === 404) {
        setReimbursements({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch reimbursements");
      }

      const result = await response.json();
      console.log('[Frontend] Received reimbursements:', {
        count: result.reimbursements?.length || 0,
        pagination: result.pagination,
        data: result.reimbursements
      });
      // Repository returns { reimbursements: [], pagination: {} }
      // Transform to { data: [], pagination: {} } for table component
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
      const response = await fetch("/api/finance/reimbursements/statistics");
      
      if (response.status === 404) {
        setStatistics({ total: 0, pending: 0, reviewed: 0, approved: 0, totalAmount: 0 });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const data = await response.json();
      setStatistics(data);
    } catch (error: any) {
      console.error("Error fetching statistics:", error);
      setStatistics({ total: 0, pending: 0, reviewed: 0, approved: 0, totalAmount: 0 });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reimbursement Review</h1>
          <p className="text-muted-foreground">
            Review and approve staff reimbursement requests
          </p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={view === "all" ? "default" : "outline"}
          onClick={() => {
            setView("all");
            // Reset to page 1 when switching views
            const params = new URLSearchParams(searchParams.toString());
            params.delete("page");
            router.push(`${pathname}?${params.toString()}`);
          }}
        >
          All Reimbursements
          {statistics && statistics.total > 0 && (
            <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-xs">
              {statistics.total}
            </span>
          )}
        </Button>
        <Button
          variant={view === "to_pay" ? "default" : "outline"}
          onClick={() => {
            setView("to_pay");
            // Reset to page 1 when switching views
            const params = new URLSearchParams(searchParams.toString());
            params.delete("page");
            router.push(`${pathname}?${params.toString()}`);
          }}
        >
          To Pay
          {statistics && statistics.approved > 0 && (
            <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-xs">
              {statistics.approved}
            </span>
          )}
        </Button>
      </div>

      {/* Statistics */}
      {isLoadingStats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-bold">{formatCurrency(statistics.totalAmount)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

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
      ) : reimbursements ? (
        <FinanceReimbursementTable 
          data={reimbursements.data} 
          pagination={reimbursements.pagination}
          showFilters={view === "all"}
        />
      ) : null}
    </div>
  );
}
