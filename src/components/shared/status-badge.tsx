/**
 * Status Badge Component
 * Reusable badge component untuk menampilkan status dengan warna yang konsisten
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ReimbursementStatus, DirectExpenseStatus, ProjectStatus } from "@/server/schema/enums";

// Status variant mapping - use base Badge variants
type StatusVariant = "default" | "secondary" | "destructive" | "outline";

interface StatusConfig {
  label: string;
  variant: StatusVariant;
  className?: string;
}

// Reimbursement Status Configuration
const reimbursementStatusConfig: Record<ReimbursementStatus, StatusConfig> = {
  [ReimbursementStatus.PENDING]: {
    label: "Pending",
    variant: "outline",
    className: "border-yellow-500 text-yellow-700 dark:text-yellow-400",
  },
  [ReimbursementStatus.REVIEWED]: {
    label: "Reviewed",
    variant: "default",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-transparent",
  },
  [ReimbursementStatus.APPROVED]: {
    label: "Approved",
    variant: "default",
    className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-transparent",
  },
  [ReimbursementStatus.PAID]: {
    label: "Paid",
    variant: "default",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border-transparent",
  },
  [ReimbursementStatus.REJECTED]: {
    label: "Rejected",
    variant: "destructive",
  },
};

// Direct Expense Status Configuration
const directExpenseStatusConfig: Record<DirectExpenseStatus, StatusConfig> = {
  [DirectExpenseStatus.PENDING]: {
    label: "Pending Approval",
    variant: "outline",
    className: "border-yellow-500 text-yellow-700 dark:text-yellow-400",
  },
  [DirectExpenseStatus.APPROVED]: {
    label: "Approved",
    variant: "default",
    className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-transparent",
  },
  [DirectExpenseStatus.PAID]: {
    label: "Paid",
    variant: "default",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border-transparent",
  },
  [DirectExpenseStatus.REJECTED]: {
    label: "Rejected",
    variant: "destructive",
  },
};

// Project Status Configuration
const projectStatusConfig: Record<ProjectStatus, StatusConfig> = {
  [ProjectStatus.ACTIVE]: {
    label: "Active",
    variant: "default",
    className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-transparent",
  },
  [ProjectStatus.ON_HOLD]: {
    label: "On Hold",
    variant: "secondary",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
  [ProjectStatus.COMPLETED]: {
    label: "Completed",
    variant: "default",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-transparent",
  },
  [ProjectStatus.CANCELLED]: {
    label: "Cancelled",
    variant: "destructive",
  },
};

// Props Types
type StatusBadgeProps = 
  | {
      type: "reimbursement";
      status: ReimbursementStatus;
      className?: string;
    }
  | {
      type: "directExpense";
      status: DirectExpenseStatus;
      className?: string;
    }
  | {
      type: "project";
      status: ProjectStatus;
      className?: string;
    };

/**
 * StatusBadge Component
 * Menampilkan badge dengan warna sesuai tipe dan status
 */
export function StatusBadge(props: StatusBadgeProps) {
  const { type, status, className } = props;

  let config: StatusConfig;

  switch (type) {
    case "reimbursement":
      config = reimbursementStatusConfig[status as ReimbursementStatus];
      break;
    case "directExpense":
      config = directExpenseStatusConfig[status as DirectExpenseStatus];
      break;
    case "project":
      config = projectStatusConfig[status as ProjectStatus];
      break;
    default:
      config = {
        label: status,
        variant: "outline",
      };
  }

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}

/**
 * Helper function untuk get status label
 */
export function getStatusLabel(type: "reimbursement" | "directExpense" | "project", status: string): string {
  switch (type) {
    case "reimbursement":
      return reimbursementStatusConfig[status as ReimbursementStatus]?.label || status;
    case "directExpense":
      return directExpenseStatusConfig[status as DirectExpenseStatus]?.label || status;
    case "project":
      return projectStatusConfig[status as ProjectStatus]?.label || status;
    default:
      return status;
  }
}
