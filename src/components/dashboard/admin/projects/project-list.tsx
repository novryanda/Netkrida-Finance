"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectCard } from "./project-card";
import { ProjectDetailDialog } from "./project-detail-dialog";
import { ProjectFormDialog } from "./project-form-dialog";
import { UpdateValueDialog } from "./update-value-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProjectStatus } from "@/server/schema/enums";
import { Plus, Search, Loader2, AlertCircle } from "lucide-react";
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
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [updateValueDialogOpen, setUpdateValueDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // Pinned projects (stored in localStorage)
  const [pinnedProjects, setPinnedProjects] = useState<string[]>([]);

  useEffect(() => {
    // Load pinned projects from localStorage
    const saved = localStorage.getItem("pinnedProjects");
    if (saved) {
      setPinnedProjects(JSON.parse(saved));
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, activeTab, sortBy, pinnedProjects]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/projects?limit=100");
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
      const response = await fetch(`/api/admin/projects/${projectId}`);
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

    // Sort pinned projects to top
    filtered.sort((a, b) => {
      const aIsPinned = pinnedProjects.includes(a.id);
      const bIsPinned = pinnedProjects.includes(b.id);
      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;
      return 0;
    });

    setFilteredProjects(filtered);
  };

  const handlePin = (projectId: string) => {
    const newPinned = [...pinnedProjects, projectId];
    setPinnedProjects(newPinned);
    localStorage.setItem("pinnedProjects", JSON.stringify(newPinned));
    toast.success("Project pinned");
  };

  const handleUnpin = (projectId: string) => {
    const newPinned = pinnedProjects.filter((id) => id !== projectId);
    setPinnedProjects(newPinned);
    localStorage.setItem("pinnedProjects", JSON.stringify(newPinned));
    toast.success("Project unpinned");
  };

  const handleCreateProject = async (data: any) => {
    try {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Project created successfully");
        fetchProjects();
      } else {
        toast.error(result.error || "Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("An error occurred while creating project");
    }
  };

  const handleUpdateProject = async (data: any) => {
    if (!selectedProject) return;

    try {
      const response = await fetch(`/api/admin/projects/${selectedProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Project updated successfully");
        fetchProjects();
      } else {
        toast.error(result.error || "Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("An error occurred while updating project");
    }
  };

  const handleUpdateValue = async (data: { newValue: number; reason: string }) => {
    if (!selectedProject) return;

    try {
      const response = await fetch(
        `/api/admin/projects/${selectedProject.id}/update-value`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Project value updated successfully");
        fetchProjects();
      } else {
        toast.error(result.error || "Failed to update project value");
      }
    } catch (error) {
      console.error("Error updating project value:", error);
      toast.error("An error occurred while updating project value");
    }
  };

  const handleCompleteProject = async () => {
    if (!selectedProject) return;

    try {
      const response = await fetch(
        `/api/admin/projects/${selectedProject.id}/complete`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Project marked as completed");
        fetchProjects();
        setCompleteDialogOpen(false);
      } else {
        toast.error(result.error || "Failed to complete project");
      }
    } catch (error) {
      console.error("Error completing project:", error);
      toast.error("An error occurred while completing project");
    }
  };

  const handleCancelProject = async () => {
    if (!selectedProject) return;

    try {
      const response = await fetch(
        `/api/admin/projects/${selectedProject.id}/cancel`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Project cancelled successfully");
        fetchProjects();
        setCancelDialogOpen(false);
      } else {
        toast.error(result.error || "Failed to cancel project");
      }
    } catch (error) {
      console.error("Error cancelling project:", error);
      toast.error("An error occurred while cancelling project");
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      const response = await fetch(`/api/admin/projects/${selectedProject.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Project deleted successfully");
        fetchProjects();
        setDeleteDialogOpen(false);
      } else {
        toast.error(result.error || "Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("An error occurred while deleting project");
    }
  };

  return (
    <div className="w-full space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Projects</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage and track all your projects
          </p>
        </div>
        <Button
          onClick={() => {
            setFormMode("create");
            setSelectedProject(null);
            setFormDialogOpen(true);
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
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
              : "Get started by creating your first project"}
          </p>
          {!searchQuery && activeTab === "all" && (
            <Button
              onClick={() => {
                setFormMode("create");
                setSelectedProject(null);
                setFormDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isPinned={pinnedProjects.includes(project.id)}
              onPin={handlePin}
              onUnpin={handleUnpin}
              onViewDetail={fetchProjectDetail}
              onEdit={(id) => {
                const proj = projects.find((p) => p.id === id);
                setSelectedProject(proj);
                setFormMode("edit");
                setFormDialogOpen(true);
              }}
              onUpdateValue={(id) => {
                const proj = projects.find((p) => p.id === id);
                setSelectedProject(proj);
                setUpdateValueDialogOpen(true);
              }}
              onComplete={(id) => {
                const proj = projects.find((p) => p.id === id);
                setSelectedProject(proj);
                setCompleteDialogOpen(true);
              }}
              onCancel={(id) => {
                const proj = projects.find((p) => p.id === id);
                setSelectedProject(proj);
                setCancelDialogOpen(true);
              }}
              onDelete={(id) => {
                const proj = projects.find((p) => p.id === id);
                setSelectedProject(proj);
                setDeleteDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <ProjectDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        project={selectedProject}
      />

      <ProjectFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        mode={formMode}
        project={selectedProject}
        onSubmit={formMode === "create" ? handleCreateProject : handleUpdateProject}
      />

      <UpdateValueDialog
        open={updateValueDialogOpen}
        onOpenChange={setUpdateValueDialogOpen}
        project={selectedProject}
        onSubmit={handleUpdateValue}
      />

      {/* Complete Confirmation Dialog */}
      <AlertDialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Project as Completed?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark "{selectedProject?.projectName}" as
              completed? This action can be reversed if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteProject}>
              Mark as Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Project?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel "{selectedProject?.projectName}"? This
              action can be reversed if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Project</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelProject}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Cancel Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedProject?.projectName}"? This
              action cannot be undone. All associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
