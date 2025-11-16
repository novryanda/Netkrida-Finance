"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  Users,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
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
  ResponsiveContainer,
  Tooltip,
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
    totalProjects: number;
    activeProjects: number;
    totalUsers: number;
    pendingReimbursements: number;
    pendingDirectExpenses: number;
    totalExpensesThisMonth: number;
    totalExpensesThisYear: number;
  };
  monthlyExpenses: Array<{ month: string; amount: number }>;
  expensesByCategory: Array<{ name: string; total: number }>;
  projectStatus: Array<{ status: string; count: number }>;
  topProjects: Array<{
    id: string;
    name: string;
    client: string;
    totalExpenses: number;
    projectValue: number;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    amount: number;
    status: string;
    user: string;
    project: string;
    date: string;
  }>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard");
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview sistem keuangan dan monitoring semua transaksi
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {data.overview.activeProjects} aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total pengguna aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Expenses This Month
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.overview.totalExpensesThisMonth)}
            </div>
            <p className="text-xs text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.pendingReimbursements +
                data.overview.pendingDirectExpenses}
            </div>
            <p className="text-xs text-muted-foreground">Menunggu review</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Expenses Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expenses Trend</CardTitle>
            <CardDescription>Total pengeluaran 6 bulan terakhir</CardDescription>
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
              <AreaChart data={data.monthlyExpenses}>
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

        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Distribusi pengeluaran per kategori</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                total: {
                  label: "Total",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <PieChart>
                <Pie
                  data={data.expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {data.expensesByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  }
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Distribusi status project</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Count",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <BarChart data={data.projectStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--chart-3))" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Expense Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Top Expense Projects</CardTitle>
            <CardDescription>Project dengan pengeluaran tertinggi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {index + 1}. {project.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {project.client}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Value: {formatCurrency(project.projectValue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {formatCurrency(project.totalExpenses)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {((project.totalExpenses / project.projectValue) * 100).toFixed(
                        1
                      )}
                      % of value
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Aktivitas terbaru di sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentActivities.map((activity) => {
              const statusConfig = {
                PENDING: { color: "text-yellow-600", bg: "bg-yellow-100" },
                REVIEWED: { color: "text-blue-600", bg: "bg-blue-100" },
                APPROVED: { color: "text-green-600", bg: "bg-green-100" },
                PAID: { color: "text-emerald-600", bg: "bg-emerald-100" },
                REJECTED: { color: "text-red-600", bg: "bg-red-100" },
              };
              const config =
                statusConfig[activity.status as keyof typeof statusConfig];

              return (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium rounded px-2 py-0.5 bg-muted">
                        {activity.type}
                      </span>
                      <span className="text-sm font-medium">{activity.user}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{activity.project}</span>
                      <span>•</span>
                      <span>
                        {new Date(activity.date).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold">{formatCurrency(activity.amount)}</p>
                    <div
                      className={`rounded-full px-3 py-1 ${config?.bg || "bg-gray-100"}`}
                    >
                      <span
                        className={`text-xs font-medium ${config?.color || "text-gray-600"}`}
                      >
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
