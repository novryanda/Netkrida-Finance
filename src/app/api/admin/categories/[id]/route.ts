/**
 * API Route: /api/admin/categories/[id]
 * Category Management - Get, Update, Deactivate
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { categoryService } from "@/server/service/admin/category.service";
import { updateCategorySchema } from "@/server/schema";
import { UserRole } from "@/server/schema/enums";

/**
 * GET /api/admin/categories/[id]
 * Get category by ID
 * @access ALL
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const category = await categoryService.getCategoryById(params.id);

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Error getting category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get category" },
      { status: error.message === "Category not found" ? 404 : 500 }
    );
  }
}

/**
 * PATCH /api/admin/categories/[id]
 * Update category
 * @access ADMIN only
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role: ADMIN only
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Only ADMIN can update categories" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input
    const validatedData = updateCategorySchema.parse(body);

    const category = await categoryService.updateCategory(
      params.id,
      validatedData
    );

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Error updating category:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to update category" },
      { status: error.message === "Category not found" ? 404 : 500 }
    );
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Deactivate category
 * @access ADMIN only
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role: ADMIN only
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Only ADMIN can deactivate categories" },
        { status: 403 }
      );
    }

    const category = await categoryService.deactivateCategory(params.id);

    return NextResponse.json({
      message: "Category deactivated successfully",
      category,
    });
  } catch (error: any) {
    console.error("Error deactivating category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to deactivate category" },
      { status: error.message === "Category not found" ? 404 : 500 }
    );
  }
}
