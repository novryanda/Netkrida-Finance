"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "./project-card";
import { ProjectDetailDialog } from "./project-detail-dialog";
import { ProjectStatus } from "@/server/schema/enums";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function ProjectList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | ProjectStatus>("all");
  const [sortBy, setSortBy] = useState("createdAt");

  // Dialog states
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, activeTab, sortBy]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/finance/projects?limit=100");
      const result = await response.json();

      if (result.success) {
        setProjects(result.data);
      } else {
        toast.error("Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("An error occurred while fetching projects");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjectDetail = async (projectId: string) => {
    try {
      const response = await fetch(`/api/finance/projects/${projectId}`);
      const result = await response.json();

      if (result.success) {
        setSelectedProject(result.data);
        setDetailDialogOpen(true);
      } else {
        toast.error("Failed to fetch project details");
      }
    } catch (error) {
      console.error("Error fetching project detail:", error);
      toast.error("An error occurred while fetching project details");
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.clientName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((project) => project.status === activeTab);
    }

    // Sort projects
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (sortBy === "deadline" || sortBy === "createdAt") {
        return new Date(bValue).getTime() - new Date(aValue).getTime();
      } else if (sortBy === "projectValue") {
        return Number(bValue) - Number(aValue);
      } else {
        return String(aValue).localeCompare(String(bValue));
      }
    });

    setFilteredProjects(filtered);
  };

  return (
    <div className="w-full space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Projects</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            View and track all projects
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px] md:w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created Date</SelectItem>
            <SelectItem value="deadline">Deadline</SelectItem>
            <SelectItem value="projectValue">Project Value</SelectItem>
            <SelectItem value="projectName">Project Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs - Scrollable on Mobile */}
      <div className="relative -mx-4 sm:mx-0">
        <div className="overflow-x-auto scrollbar-hide border-b">
          <div className="flex gap-2 px-4 sm:px-0 pb-px min-w-max sm:min-w-0">
            <Button
              variant={activeTab === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("all")}
              className="whitespace-nowrap"
            >
              All Projects
            </Button>
            <Button
              variant={activeTab === ProjectStatus.ACTIVE ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(ProjectStatus.ACTIVE)}
              className="whitespace-nowrap"
            >
              Active
            </Button>
            <Button
              variant={activeTab === ProjectStatus.COMPLETED ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(ProjectStatus.COMPLETED)}
              className="whitespace-nowrap"
            >
              Completed
            </Button>
            <Button
              variant={activeTab === ProjectStatus.CANCELLED ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(ProjectStatus.CANCELLED)}
              className="whitespace-nowrap"
            >
              Cancelled
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || activeTab !== "all"
              ? "Try adjusting your filters"
              : "No projects available at the moment"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onViewDetail={fetchProjectDetail}
            />
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <ProjectDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        project={selectedProject}
      />
    </div>
  );
}
