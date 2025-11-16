/**
 * Category Detail View Component
 * Shows category information and all expenses in this category
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, FileText, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";

interface CategoryDetailViewProps {
  categoryId: string;
}

interface CategoryData {
  category: {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    _count: {
      expenses: number;
      directExpenses: number;
    };
  };
  expenses: any[];
  directExpenses: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics: {
    totalExpenses: number;
    totalDirectExpenses: number;
    totalAmount: number;
    expensesAmount: number;
    directExpensesAmount: number;
    projectBreakdown: Array<{
      project: {
        id: string;
        projectName: string;
        clientName: string;
      } | null;
      totalAmount: number;
      count: number;
    }>;
  };
}

export function CategoryDetailView({ categoryId }: CategoryDetailViewProps) {
  const router = useRouter();
  const [data, setData] = useState<CategoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategoryDetails();
  }, [categoryId]);

  const fetchCategoryDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/categories/${categoryId}/expenses`);

      if (!response.ok) {
        throw new Error("Failed to fetch category details");
      }

      const result = await response.json();
      setData(result);
    } catch (error: any) {
      console.error("Error fetching category details:", error);
      toast.error(error.message || "Failed to load category details");
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
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
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
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Category not found</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/admin/categories">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/admin/categories")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{data.category.name}</h1>
            <Badge variant={data.category.isActive ? "default" : "secondary"}>
              {data.category.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {data.category.description || "No description"}
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(data.statistics.totalAmount)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recorded Expenses</p>
                <p className="text-2xl font-bold">{data.statistics.totalExpenses}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(data.statistics.expensesAmount)}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Direct Expenses</p>
                <p className="text-2xl font-bold">{data.statistics.totalDirectExpenses}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(data.statistics.directExpensesAmount)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-lg font-bold">
                  {format(new Date(data.category.createdAt), "dd MMM yyyy")}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Breakdown */}
      {data.statistics.projectBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Project</CardTitle>
            <CardDescription>
              Breakdown of expenses per project in this category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.statistics.projectBreakdown.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {item.project ? (
                        <div>
                          <p className="font-medium">{item.project.projectName}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.project.clientName}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">
                          General Expense (No Project)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.totalAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Expenses */}
      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expenses">
            Recorded Expenses ({data.statistics.totalExpenses})
          </TabsTrigger>
          <TabsTrigger value="direct">
            Direct Expenses ({data.statistics.totalDirectExpenses})
          </TabsTrigger>
        </TabsList>

        {/* Recorded Expenses Tab */}
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Recorded Expenses</CardTitle>
              <CardDescription>
                All finalized expenses recorded in this category
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.expenses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Recorded By</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>
                          {format(new Date(expense.expenseDate), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {expense.description}
                        </TableCell>
                        <TableCell>
                          {expense.project ? (
                            <div>
                              <p className="font-medium text-sm">
                                {expense.project.projectName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {expense.project.clientName}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm italic">
                              No Project
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{expense.recordedBy.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {expense.recordedBy.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recorded expenses in this category yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Direct Expenses Tab */}
        <TabsContent value="direct">
          <Card>
            <CardHeader>
              <CardTitle>Direct Expense Requests</CardTitle>
              <CardDescription>
                All direct expense requests in this category (all statuses)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.directExpenses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.directExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>
                          {format(new Date(expense.expenseDate), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {expense.description}
                        </TableCell>
                        <TableCell>
                          {expense.project ? (
                            <div>
                              <p className="font-medium text-sm">
                                {expense.project.projectName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {expense.project.clientName}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm italic">
                              No Project
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{expense.createdBy.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {expense.createdBy.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge type="directExpense" status={expense.status} />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No direct expenses in this category yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
