"use client";

import { useEffect, useState } from "react";
import { Wallet, FileText, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
    approvedReimbursements: number;
    approvedReimbursementsAmount: number;
    approvedDirectExpenses: number;
    approvedDirectExpensesAmount: number;
    paidThisMonth: number;
    paidThisMonthAmount: number;
  };
  approvedReimbursements: Array<{
    id: string;
    amount: number;
    description: string;
    approvedAt: string;
    submittedBy: {
      id: string;
      name: string;
      email: string;
      bankName: string;
      bankAccountNo: string;
    };
    project: {
      projectName: string;
      clientName: string;
    };
  }>;
  approvedDirectExpenses: Array<{
    id: string;
    amount: number;
    description: string;
    approvedAt: string;
    createdBy: {
      id: string;
      name: string;
      email: string;
    };
    project: {
      projectName: string;
      clientName: string;
    } | null;
    category: {
      name: string;
    };
  }>;
  recentPayments: Array<{
    id: string;
    type: string;
    description: string;
    amount: number;
    user: string;
    project: string;
    paidAt: string;
  }>;
  paymentTrend: Array<{
    month: string;
    reimbursements: number;
    directExpenses: number;
    total: number;
  }>;
}

export default function FinanceDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/finance/dashboard");
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
        <h1 className="text-3xl font-bold tracking-tight">Finance Dashboard</h1>
        <p className="text-muted-foreground">
          Kelola pembayaran dan reimbursement yang sudah di-approve
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved Reimbursements
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.approvedReimbursements}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(data.overview.approvedReimbursementsAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved Direct Expenses
            </CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.approvedDirectExpenses}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(data.overview.approvedDirectExpensesAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.paidThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(data.overview.paidThisMonthAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total to Pay</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.approvedReimbursements +
                data.overview.approvedDirectExpenses}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(
                data.overview.approvedReimbursementsAmount +
                  data.overview.approvedDirectExpensesAmount
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Trend (6 Months)</CardTitle>
          <CardDescription>
            Tren pembayaran reimbursement dan direct expense
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              reimbursements: {
                label: "Reimbursements",
                color: "hsl(var(--chart-1))",
              },
              directExpenses: {
                label: "Direct Expenses",
                color: "hsl(var(--chart-2))",
              },
              total: {
                label: "Total",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[350px]"
          >
            <AreaChart data={data.paymentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="reimbursements"
                stackId="1"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="directExpenses"
                stackId="1"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Approved Reimbursements */}
      <Card>
        <CardHeader>
          <CardTitle>Approved Reimbursements - Siap Dibayar</CardTitle>
          <CardDescription>
            Reimbursement yang sudah di-approve Admin dan menunggu pembayaran
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.approvedReimbursements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Tidak ada reimbursement yang menunggu pembayaran
              </p>
            ) : (
              data.approvedReimbursements.map((reimburse) => (
                <div
                  key={reimburse.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {reimburse.submittedBy.name || reimburse.submittedBy.email}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        ({reimburse.id.slice(0, 8)})
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {reimburse.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Project: {reimburse.project.projectName} (
                        {reimburse.project.clientName})
                      </span>
                      <span>•</span>
                      <span>
                        Approved:{" "}
                        {new Date(reimburse.approvedAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="font-medium">
                        {reimburse.submittedBy.bankName || "N/A"} -{" "}
                        {reimburse.submittedBy.bankAccountNo || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatCurrency(reimburse.amount)}
                      </p>
                    </div>
                    <Button size="sm">Process Payment</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approved Direct Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Approved Direct Expenses - Siap Dibayar</CardTitle>
          <CardDescription>
            Direct expense yang sudah di-approve dan menunggu pembayaran
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.approvedDirectExpenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Tidak ada direct expense yang menunggu pembayaran
              </p>
            ) : (
              data.approvedDirectExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium rounded px-2 py-0.5 bg-blue-100 text-blue-600">
                        {expense.category.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({expense.id.slice(0, 8)})
                      </span>
                    </div>
                    <p className="text-sm font-medium">{expense.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Created by: {expense.createdBy.name || expense.createdBy.email}
                      </span>
                      <span>•</span>
                      <span>
                        Project:{" "}
                        {expense.project?.projectName || "No Project Assigned"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Approved:{" "}
                      {new Date(expense.approvedAt).toLocaleDateString("id-ID")}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatCurrency(expense.amount)}
                      </p>
                    </div>
                    <Button size="sm">Process Payment</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Pembayaran yang sudah selesai</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentPayments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Belum ada pembayaran
              </p>
            ) : (
              data.recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium rounded px-2 py-0.5 bg-muted">
                        {payment.type}
                      </span>
                      <p className="font-medium">{payment.user}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {payment.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{payment.project}</span>
                      <span>•</span>
                      <span>
                        Paid: {new Date(payment.paidAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{formatCurrency(payment.amount)}</p>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
