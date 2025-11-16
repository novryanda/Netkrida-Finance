/**
 * API Route: /api/admin/categories
 * Category Management - List & Create
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { categoryService } from "@/server/service/admin/category.service";
import { createCategorySchema, getCategoriesSchema } from "@/server/schema";
import { UserRole } from "@/server/schema/enums";

/**
 * GET /api/admin/categories
 * Get all categories with filters
 * @access ADMIN, FINANCE, STAFF (all authenticated users)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Allow all authenticated users to read categories
    // No role restriction for GET

    // Parse query params
    const searchParams = req.nextUrl.searchParams;
    const filters = {
      isActive: searchParams.get("isActive") === "true" ? true :
                searchParams.get("isActive") === "false" ? false : undefined,
      search: searchParams.get("search") ?? undefined,
      page: parseInt(searchParams.get("page") ?? "1"),
      limit: parseInt(searchParams.get("limit") ?? "20"),
    };

    // Validate filters
    const validatedFilters = getCategoriesSchema.parse(filters);

    const result = await categoryService.getCategories(validatedFilters);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error getting categories:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get categories" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/categories
 * Create new category
 * @access ADMIN, FINANCE
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role: ADMIN or FINANCE
    if (
      session.user.role !== UserRole.ADMIN &&
      session.user.role !== UserRole.FINANCE
    ) {
      return NextResponse.json(
        { error: "Forbidden: Only ADMIN or FINANCE can create categories" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input
    const validatedData = createCategorySchema.parse(body);

    const category = await categoryService.createCategory(
      validatedData,
      session.user.id
    );

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("Error creating category:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}
