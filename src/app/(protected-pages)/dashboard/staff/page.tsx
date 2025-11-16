"use client";

import { useEffect, useState } from "react";
import { Receipt, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface DashboardData {
  overview: {
    totalReimbursements: number;
    pendingReimbursements: number;
    approvedReimbursements: number;
    paidReimbursements: number;
    paidThisMonth: number;
  };
  reimbursements: Array<{
    id: string;
    amount: number;
    description: string;
    expenseDate: string;
    status: string;
    createdAt: string;
    project: {
      projectName: string;
      clientName: string;
    };
  }>;
  reimbursementsByStatus: Array<{
    status: string;
    count: number;
    total: number;
  }>;
  monthlyReimbursements: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
  bankInfo: {
    bankName: string | null;
    bankAccountNo: string | null;
    name: string | null;
  } | null;
}

const COLORS = ["#FFBB28", "#00C49F", "#0088FE", "#FF8042"];

export default function StaffDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/staff/dashboard");
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Failed to load dashboard data</div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
          <p className="text-muted-foreground">
            Kelola expense dan reimbursement Anda
          </p>
        </div>
        <Link href="/dashboard/staff/reimbursements/new">
          <Button>
            <Receipt className="mr-2 h-4 w-4" />
            Submit New Reimbursement
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Reimbursements
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.totalReimbursements}
            </div>
            <p className="text-xs text-muted-foreground">Semua waktu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.pendingReimbursements}
            </div>
            <p className="text-xs text-muted-foreground">Menunggu approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.approvedReimbursements}
            </div>
            <p className="text-xs text-muted-foreground">Menunggu pembayaran</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.overview.paidThisMonth)}
            </div>
            <p className="text-xs text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Reimbursements Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Reimbursements</CardTitle>
            <CardDescription>
              Reimbursement 6 bulan terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                amount: {
                  label: "Amount",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <AreaChart data={data.monthlyReimbursements}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) =>
                    `${(value / 1000000).toFixed(1)}M`
                  }
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Reimbursements by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Distribusi berdasarkan status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Count",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <PieChart>
                <Pie
                  data={data.reimbursementsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.status}: ${entry.count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.reimbursementsByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, props) => [
                        `${value} items (${formatCurrency(props.payload.total)})`,
                        name,
                      ]}
                    />
                  }
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reimbursements */}
      <Card>
        <CardHeader>
          <CardTitle>My Recent Reimbursements</CardTitle>
          <CardDescription>Status reimbursement terbaru Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.reimbursements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Belum ada reimbursement
              </p>
            ) : (
              data.reimbursements.map((reimburse) => {
                const statusConfig = {
                  PENDING: {
                    color: "text-yellow-600",
                    bg: "bg-yellow-100",
                    icon: Clock,
                  },
                  REVIEWED: {
                    color: "text-blue-600",
                    bg: "bg-blue-100",
                    icon: CheckCircle,
                  },
                  APPROVED: {
                    color: "text-green-600",
                    bg: "bg-green-100",
                    icon: CheckCircle,
                  },
                  PAID: {
                    color: "text-emerald-600",
                    bg: "bg-emerald-100",
                    icon: CheckCircle,
                  },
                  REJECTED: {
                    color: "text-red-600",
                    bg: "bg-red-100",
                    icon: XCircle,
                  },
                };
                const config =
                  statusConfig[
                    reimburse.status as keyof typeof statusConfig
                  ];
                const StatusIcon = config?.icon || Clock;

                return (
                  <div
                    key={reimburse.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {reimburse.project.projectName}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          ({reimburse.id.slice(0, 8)})
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {reimburse.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(reimburse.expenseDate).toLocaleDateString(
                          "id-ID"
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold">{formatCurrency(reimburse.amount)}</p>
                      <div
                        className={`flex items-center gap-1 rounded-full px-3 py-1 ${config?.bg || "bg-gray-100"}`}
                      >
                        <StatusIcon
                          className={`h-3 w-3 ${config?.color || "text-gray-600"}`}
                        />
                        <span
                          className={`text-xs font-medium ${config?.color || "text-gray-600"}`}
                        >
                          {reimburse.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Bank Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Aksi cepat yang sering digunakan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/staff/reimbursements/new" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Receipt className="mr-2 h-4 w-4" />
                Submit New Reimbursement
              </Button>
            </Link>
            <Link href="/dashboard/staff/reimbursements" className="block">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                View All Reimbursements
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank Account Info</CardTitle>
            <CardDescription>
              Informasi rekening untuk reimbursement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.bankInfo ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Account Name:</span>
                  <span className="font-medium">{data.bankInfo.name || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bank Name:</span>
                  <span className="font-medium">
                    {data.bankInfo.bankName || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Account Number:</span>
                  <span className="font-medium">
                    {data.bankInfo.bankAccountNo || "Not set"}
                  </span>
                </div>
                <Button variant="link" size="sm" className="p-0 h-auto">
                  Update Bank Info
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tidak ada informasi bank
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
