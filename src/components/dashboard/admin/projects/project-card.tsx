"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectStatus } from "@/server/schema/enums";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Calendar,
  DollarSign,
  MoreVertical,
  Building2,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Pin,
  PinOff,
} from "lucide-react";
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
  isPinned?: boolean;
  onPin?: (projectId: string) => void;
  onUnpin?: (projectId: string) => void;
  onViewDetail: (projectId: string) => void;
  onEdit: (projectId: string) => void;
  onUpdateValue: (projectId: string) => void;
  onComplete: (projectId: string) => void;
  onCancel: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

export function ProjectCard({
  project,
  isPinned = false,
  onPin,
  onUnpin,
  onViewDetail,
  onEdit,
  onUpdateValue,
  onComplete,
  onCancel,
  onDelete,
}: ProjectCardProps) {
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

  const handlePinToggle = () => {
    if (isPinned && onUnpin) {
      onUnpin(project.id);
    } else if (!isPinned && onPin) {
      onPin(project.id);
    }
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:shadow-lg cursor-pointer",
        isPinned && "ring-2 ring-yellow-400"
      )}
      onClick={() => onViewDetail(project.id)}
    >
      {/* Pin Toggle */}
      <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
        <ToggleGroup type="single" value={isPinned ? "pinned" : "unpinned"}>
          <ToggleGroupItem
            value={isPinned ? "pinned" : "unpinned"}
            onClick={handlePinToggle}
            size="sm"
            className="h-8 w-8 p-0"
          >
            {isPinned ? (
              <Pin className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ) : (
              <PinOff className="h-4 w-4" />
            )}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 pr-10">
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
        <div className="flex items-center justify-between w-full gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail(project.id);
            }}
          >
            View Details
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(project.id);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateValue(project.id);
                }}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Update Value
              </DropdownMenuItem>

              {project.status === ProjectStatus.ACTIVE && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onComplete(project.id);
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                    Mark as Complete
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel(project.id);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2 text-red-600" />
                    Cancel Project
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project.id);
                }}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
}
