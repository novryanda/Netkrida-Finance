/**
 * Staff Reimbursements List Component
 * Fetches and displays reimbursements dengan statistics
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReimbursementTable } from "./reimbursement-table";
import Link from "next/link";
import { Plus, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Statistics {
  total: number;
  pending: number;
  approved: number;
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

export function StaffReimbursementsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reimbursements, setReimbursements] = useState<ReimbursementData | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

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
      
      const response = await fetch(`/api/staff/reimbursements?${params.toString()}`);
      
      if (response.status === 404) {
        setReimbursements({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch reimbursements");
      }

      const data = await response.json();
      setReimbursements(data);
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
      const response = await fetch("/api/staff/reimbursements/statistics");
      
      if (response.status === 404) {
        setStatistics({ total: 0, pending: 0, approved: 0, rejected: 0, totalAmount: 0 });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const data = await response.json();
      setStatistics(data);
    } catch (error: any) {
      console.error("Error fetching statistics:", error);
      setStatistics({ total: 0, pending: 0, approved: 0, rejected: 0, totalAmount: 0 });
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
          <h1 className="text-3xl font-bold tracking-tight">My Reimbursements</h1>
          <p className="text-muted-foreground">
            Submit and track your expense reimbursement requests
          </p>
        </div>
        <Link href="/dashboard/staff/reimbursements/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>

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
                  <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold">{statistics.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
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
                <TrendingUp className="h-8 w-8 text-purple-500" />
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
        <ReimbursementTable />
      ) : null}
    </div>
  );
}
