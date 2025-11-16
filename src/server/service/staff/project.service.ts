/**
 * Staff Project Service
 * Service untuk role Staff - hanya read-only access
 */

import { projectRepository } from "@/server/repositories/project.repository";
import { ProjectStatus } from "@/server/schema/enums";

export class StaffProjectService {
  /**
   * Get all projects (read-only untuk Staff)
   */
  async getAllProjects(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: ProjectStatus;
    clientName?: string;
    fromDate?: Date | string;
    toDate?: Date | string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    try {
      const result = await projectRepository.findAll(params);
      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
      };
    } catch (error) {
      console.error("Error getting projects:", error);
      return {
        success: false,
        error: "Failed to fetch projects",
      };
    }
  }

  /**
   * Get project by ID (read-only untuk Staff)
   */
  async getProjectById(id: string) {
    try {
      const project = await projectRepository.findById(id);

      if (!project) {
        return {
          success: false,
          error: "Project not found",
        };
      }

      return {
        success: true,
        data: project,
      };
    } catch (error) {
      console.error("Error getting project:", error);
      return {
        success: false,
        error: "Failed to fetch project",
      };
    }
  }
}

export const staffProjectService = new StaffProjectService();
