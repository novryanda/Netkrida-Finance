/**
 * Finance New Direct Expense Component
 * Form untuk create direct expense
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DirectExpenseForm } from "./direct-expense-form";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function FinanceNewDirectExpense() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const [projectsRes, categoriesRes] = await Promise.all([
        fetch("/api/finance/projects?status=ACTIVE"),
        fetch("/api/admin/categories?isActive=true"),
      ]);

      if (!projectsRes.ok) {
        const error = await projectsRes.json();
        throw new Error(error.error || "Failed to fetch projects");
      }

      if (!categoriesRes.ok) {
        const error = await categoriesRes.json();
        throw new Error(error.error || "Failed to fetch categories");
      }

      const projectsData = await projectsRes.json();
      const categoriesData = await categoriesRes.json();

      // Projects API returns: { success: true, data: [...], pagination: {...} }
      setProjects(projectsData.data || []);

      // Categories API returns: { categories: [...], pagination: {...} }
      setCategories(categoriesData.categories || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error(error.message || "Failed to load form data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    router.push("/dashboard/finance/direct-expenses");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/finance/direct-expenses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Direct Expense</h1>
            <p className="text-muted-foreground">
              Create a direct expense for a project
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-6">
          <DirectExpenseForm
            projects={projects}
            categories={categories}
            onSuccess={handleSuccess}
            onCategoryCreated={fetchData}
          />
        </CardContent>
      </Card>
    </div>
  );
}
