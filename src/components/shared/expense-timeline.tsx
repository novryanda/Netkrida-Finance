/**
 * Expense Timeline Component
 * Menampilkan timeline workflow dari expense (reimbursement/direct expense)
 */

"use client";

import { cn } from "@/lib/utils";
import { ReimbursementStatus, DirectExpenseStatus } from "@/server/schema/enums";
import { CheckCircle2, Circle, Clock, XCircle, DollarSign } from "lucide-react";
import { format } from "date-fns";

// Timeline Step Configuration
interface TimelineStep {
  label: string;
  icon: React.ElementType;
  completed: boolean;
  current: boolean;
  rejected?: boolean;
  date?: Date | null;
  actor?: string | null;
  notes?: string | null;
}

interface ReimbursementTimelineProps {
  type: "reimbursement";
  status: ReimbursementStatus;
  submittedAt: Date;
  submittedBy?: string;
  reviewedAt?: Date | null;
  reviewedBy?: string | null;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  paidAt?: Date | null;
  paidBy?: string | null;
  rejectionReason?: string | null;
  className?: string;
}

interface DirectExpenseTimelineProps {
  type: "directExpense";
  status: DirectExpenseStatus;
  createdAt: Date;
  createdBy?: string;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  paidAt?: Date | null;
  paidBy?: string | null;
  rejectionReason?: string | null;
  className?: string;
}

type ExpenseTimelineProps = ReimbursementTimelineProps | DirectExpenseTimelineProps;

/**
 * ExpenseTimeline Component
 * Timeline visual untuk tracking progress expense
 */
export function ExpenseTimeline(props: ExpenseTimelineProps) {
  const { type, status, className } = props;

  let steps: TimelineStep[] = [];

  if (type === "reimbursement") {
    const {
      submittedAt,
      submittedBy,
      reviewedAt,
      reviewedBy,
      approvedAt,
      approvedBy,
      paidAt,
      paidBy,
      rejectionReason,
    } = props;

    const isRejected = status === ReimbursementStatus.REJECTED;

    steps = [
      {
        label: "Submitted",
        icon: Circle,
        completed: true,
        current: status === ReimbursementStatus.PENDING && !isRejected,
        date: submittedAt,
        actor: submittedBy,
      },
      {
        label: "Reviewed by Finance",
        icon: CheckCircle2,
        completed: status !== ReimbursementStatus.PENDING && !isRejected,
        current: status === ReimbursementStatus.REVIEWED && !isRejected,
        rejected: isRejected && !reviewedAt, // Rejected before review
        date: reviewedAt,
        actor: reviewedBy,
      },
      {
        label: "Approved by Admin",
        icon: CheckCircle2,
        completed:
          (status === ReimbursementStatus.APPROVED || status === ReimbursementStatus.PAID) &&
          !isRejected,
        current: status === ReimbursementStatus.APPROVED && !isRejected,
        rejected: isRejected && !!reviewedAt && !approvedAt, // Rejected after review
        date: approvedAt,
        actor: approvedBy,
      },
      {
        label: "Paid",
        icon: DollarSign,
        completed: status === ReimbursementStatus.PAID && !isRejected,
        current: false,
        date: paidAt,
        actor: paidBy,
      },
    ];

    if (isRejected) {
      steps.push({
        label: "Rejected",
        icon: XCircle,
        completed: true,
        current: true,
        rejected: true,
        notes: rejectionReason || undefined,
      });
    }
  } else {
    // Direct Expense
    const { createdAt, createdBy, approvedAt, approvedBy, paidAt, paidBy, rejectionReason } =
      props;

    const isRejected = status === DirectExpenseStatus.REJECTED;

    steps = [
      {
        label: "Created by Finance",
        icon: Circle,
        completed: true,
        current: status === DirectExpenseStatus.PENDING && !isRejected,
        date: createdAt,
        actor: createdBy,
      },
      {
        label: "Approved by Admin",
        icon: CheckCircle2,
        completed:
          (status === DirectExpenseStatus.APPROVED || status === DirectExpenseStatus.PAID) &&
          !isRejected,
        current: status === DirectExpenseStatus.APPROVED && !isRejected,
        rejected: isRejected,
        date: approvedAt,
        actor: approvedBy,
      },
      {
        label: "Paid",
        icon: DollarSign,
        completed: status === DirectExpenseStatus.PAID && !isRejected,
        current: false,
        date: paidAt,
        actor: paidBy,
      },
    ];

    if (isRejected) {
      steps.push({
        label: "Rejected",
        icon: XCircle,
        completed: true,
        current: true,
        rejected: true,
        notes: rejectionReason || undefined,
      });
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="relative flex gap-4">
            {/* Vertical Line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-4 top-8 w-0.5 h-full",
                  step.completed && !step.rejected
                    ? "bg-green-500"
                    : step.rejected
                      ? "bg-red-500"
                      : "bg-gray-300 dark:bg-gray-700"
                )}
              />
            )}

            {/* Icon */}
            <div
              className={cn(
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2",
                step.completed && !step.rejected
                  ? "border-green-500 bg-green-100 dark:bg-green-900"
                  : step.rejected
                    ? "border-red-500 bg-red-100 dark:bg-red-900"
                    : step.current
                      ? "border-blue-500 bg-blue-100 dark:bg-blue-900"
                      : "border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  step.completed && !step.rejected
                    ? "text-green-600 dark:text-green-400"
                    : step.rejected
                      ? "text-red-600 dark:text-red-400"
                      : step.current
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400 dark:text-gray-600"
                )}
              />
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <div className="flex items-center justify-between">
                <h4
                  className={cn(
                    "font-medium",
                    step.completed || step.current
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </h4>
                {step.current && !step.completed && (
                  <Clock className="h-4 w-4 text-blue-500" />
                )}
              </div>

              {/* Date and Actor */}
              {step.date && (
                <p className="text-sm text-muted-foreground">
                  {format(new Date(step.date), "PPp")}
                  {step.actor && <span className="ml-1">• {step.actor}</span>}
                </p>
              )}

              {/* Notes (for rejection) */}
              {step.notes && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  {step.notes}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
