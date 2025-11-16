/**
 * Category Service
 * Business logic untuk Category Management
 */

import { categoryRepository } from "../../repositories/category.repository";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  GetCategoriesInput,
} from "../../schema/category.schema";

export class CategoryService {
  /**
   * Create new category
   * @access ADMIN, FINANCE (on-the-fly)
   */
  async createCategory(data: CreateCategoryInput, createdById: string) {
    // Check if category name already exists
    const existing = await categoryRepository.findByName(data.name);
    if (existing) {
      throw new Error("Category with this name already exists");
    }

    return await categoryRepository.create(data, createdById);
  }

  /**
   * Get category by ID
   * @access ALL
   */
  async getCategoryById(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  }

  /**
   * Get all categories with filters
   * @access ALL
   */
  async getCategories(filters: GetCategoriesInput) {
    return await categoryRepository.findMany(filters);
  }

  /**
   * Get active categories for dropdowns
   * @access ALL
   */
  async getActiveCategories() {
    return await categoryRepository.findAllActive();
  }

  /**
   * Update category
   * @access ADMIN only
   */
  async updateCategory(id: string, data: UpdateCategoryInput) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }

    // If changing name, check uniqueness
    if (data.name && data.name !== category.name) {
      const existing = await categoryRepository.findByName(data.name);
      if (existing) {
        throw new Error("Category with this name already exists");
      }
    }

    return await categoryRepository.update(id, data);
  }

  /**
   * Deactivate category
   * @access ADMIN only
   */
  async deactivateCategory(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }

    // Check if category is in use
    const inUse = await categoryRepository.isInUse(id);
    if (inUse) {
      throw new Error(
        "Cannot deactivate category that is being used in expenses"
      );
    }

    return await categoryRepository.deactivate(id);
  }

  /**
   * Activate category
   * @access ADMIN only
   */
  async activateCategory(id: string) {
    return await categoryRepository.update(id, { isActive: true });
  }
}

export const categoryService = new CategoryService();
