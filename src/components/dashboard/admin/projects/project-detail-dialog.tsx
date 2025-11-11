"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProjectStatus, ExpenseType } from "@/server/schema/enums";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Calendar,
  DollarSign,
  Building2,
  FileText,
  TrendingUp,
  TrendingDown,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    projectName: string;
    clientName: string;
    projectValue: string | number;
    deadline: Date | string;
    status: ProjectStatus;
    description: string | null;
    createdAt: Date | string;
    createdBy: {
      name: string | null;
      email: string | null;
    };
    expenses?: Array<{
      id: string;
      description: string;
      amount: string | number;
      expenseDate: Date | string;
      expenseType: ExpenseType;
      createdBy: {
        name: string | null;
      };
    }>;
    projectRevisions?: Array<{
      id: string;
      oldValue: string | number;
      newValue: string | number;
      reason: string;
      changedAt: Date | string;
      changedBy: {
        name: string | null;
      };
    }>;
    totalExpenses?: number;
    remainingBudget?: number;
  } | null;
}

export function ProjectDetailDialog({
  open,
  onOpenChange,
  project,
}: ProjectDetailDialogProps) {
  if (!project) return null;

  const statusConfig = {
    [ProjectStatus.ACTIVE]: {
      label: "Active",
      className: "bg-blue-500",
    },
    [ProjectStatus.COMPLETED]: {
      label: "Completed",
      className: "bg-green-500",
    },
    [ProjectStatus.CANCELLED]: {
      label: "Cancelled",
      className: "bg-red-500",
    },
    [ProjectStatus.ON_HOLD]: {
      label: "On Hold",
      className: "bg-gray-500",
    },
  };

  const expenses = project.expenses || [];
  const projectRevisions = project.projectRevisions || [];
  const totalExpenses = project.totalExpenses || 0;
  const projectValue = Number(project.projectValue);
  const remainingBudget = project.remainingBudget ?? projectValue - totalExpenses;
  const budgetPercentage = (totalExpenses / projectValue) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{project.projectName}</DialogTitle>
          <DialogDescription>
            Project details and expense information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Info Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Project Information</h3>
              <Badge className={statusConfig[project.status].className}>
                {statusConfig[project.status].label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium">{project.clientName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="font-medium">
                    {format(new Date(project.deadline), "dd MMM yyyy", {
                      locale: localeId,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Project Value</p>
                  <p className="font-medium">
                    Rp {projectValue.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p className="font-medium">
                    {project.createdBy.name || project.createdBy.email}
                  </p>
                </div>
              </div>
            </div>

            {project.description && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm mt-1">{project.description}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Budget Overview Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Budget Overview</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted flex flex-col items-start break-words">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span>Project Value</span>
                </div>
                <p className="text-lg sm:text-xl font-bold break-all max-w-full">
                  Rp {projectValue.toLocaleString("id-ID")}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted flex flex-col items-start break-words">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingDown className="h-4 w-4" />
                  <span>Total Expenses</span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-red-600 break-all max-w-full">
                  Rp {totalExpenses.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {budgetPercentage.toFixed(1)}% of budget
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted flex flex-col items-start break-words">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Remaining</span>
                </div>
                <p
                  className={cn(
                    "text-lg sm:text-xl font-bold break-all max-w-full",
                    remainingBudget < 0 ? "text-red-600" : "text-green-600"
                  )}
                >
                  Rp {remainingBudget.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Budget Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Budget Usage</span>
                <span className="font-medium">{budgetPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all",
                    budgetPercentage > 100
                      ? "bg-red-600"
                      : budgetPercentage > 80
                        ? "bg-yellow-500"
                        : "bg-blue-600"
                  )}
                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Expenses List Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Expenses ({expenses.length})
              </h3>
            </div>

            {expenses.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="text-sm">
                          {format(new Date(expense.expenseDate), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm truncate">{expense.description}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {expense.expenseType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {expense.createdBy?.name || "Unknown"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          Rp {Number(expense.amount).toLocaleString("id-ID")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No expenses recorded yet</p>
              </div>
            )}
          </div>

          {/* Project Revisions Section */}
          {projectRevisions.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Value Revision History</h3>
                <div className="space-y-2">
                  {projectRevisions.map((revision) => (
                    <div
                      key={revision.id}
                      className="p-3 rounded-lg bg-muted text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">
                          {revision.changedBy?.name || "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(revision.changedAt), "dd MMM yyyy HH:mm")}
                        </span>
                      </div>
                      <p className="text-muted-foreground">
                        Changed value from Rp{" "}
                        {Number(revision.oldValue).toLocaleString("id-ID")} to Rp{" "}
                        {Number(revision.newValue).toLocaleString("id-ID")}
                      </p>
                      <p className="text-xs mt-1">{revision.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
