"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectStatus } from "@/server/schema/enums";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Calendar, DollarSign, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: {
    id: string;
    projectName: string;
    clientName: string;
    projectValue: string | number;
    deadline: Date | string;
    status: ProjectStatus;
    description: string | null;
    createdAt: Date | string;
    _count?: {
      expenses: number;
    };
  };
  onViewDetail: (projectId: string) => void;
}

export function ProjectCard({ project, onViewDetail }: ProjectCardProps) {
  const statusConfig = {
    [ProjectStatus.ACTIVE]: {
      label: "Active",
      variant: "default" as const,
      className: "bg-blue-500",
    },
    [ProjectStatus.COMPLETED]: {
      label: "Completed",
      variant: "default" as const,
      className: "bg-green-500",
    },
    [ProjectStatus.CANCELLED]: {
      label: "Cancelled",
      variant: "destructive" as const,
      className: "bg-red-500",
    },
    [ProjectStatus.ON_HOLD]: {
      label: "On Hold",
      variant: "secondary" as const,
      className: "bg-gray-500",
    },
  };

  const deadlineDate = new Date(project.deadline);
  const isOverdue =
    project.status === ProjectStatus.ACTIVE && deadlineDate < new Date();

  return (
    <Card
      className="relative overflow-hidden transition-all hover:shadow-lg cursor-pointer"
      onClick={() => onViewDetail(project.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">
              {project.projectName}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{project.clientName}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Status Badge */}
        <Badge className={statusConfig[project.status].className}>
          {statusConfig[project.status].label}
        </Badge>

        {/* Project Value */}
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">
            Rp {Number(project.projectValue).toLocaleString("id-ID")}
          </span>
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className={cn(isOverdue && "text-red-500 font-semibold")}>
            {format(deadlineDate, "dd MMM yyyy", { locale: localeId })}
            {isOverdue && " (Overdue)"}
          </span>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Expense Count */}
        {project._count && (
          <div className="text-xs text-muted-foreground">
            {project._count.expenses} expense(s)
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t" onClick={(e) => e.stopPropagation()}>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail(project.id);
          }}
          className="w-full"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
