/**
 * Staff New Reimbursement Component
 * Form untuk submit reimbursement dengan data fetching
 */

"use client";

import { useEffect, useState } from "react";
import { ReimbursementForm } from "./reimbursement-form";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Project {
  id: string;
  projectName: string;
  clientName: string;
  status: string;
}

export function StaffNewReimbursement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/staff/projects?status=ACTIVE&limit=100");
      
      if (response.status === 404) {
        setProjects([]);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(data.data || []);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/staff/reimbursements">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Reimbursement Request</h1>
          <p className="text-muted-foreground">
            Submit a new expense reimbursement request
          </p>
        </div>
      </div>

      {/* Form */}
      {isLoading ? (
        <Card className="p-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </Card>
      ) : projects.length === 0 ? (
        <Card className="p-8">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">No Active Projects</p>
            <p className="text-muted-foreground">
              There are no active projects available. Please contact your administrator.
            </p>
            <Link href="/dashboard/staff/reimbursements">
              <Button variant="outline" className="mt-4">
                Go Back
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <ReimbursementForm projects={projects} />
      )}
    </div>
  );
}
