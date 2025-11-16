/**
 * API Route: /api/admin/categories/active
 * Get active categories for dropdowns
 */

import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { categoryService } from "@/server/service/admin/category.service";

/**
 * GET /api/admin/categories/active
 * Get all active categories
 * @access ALL authenticated users
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await categoryService.getActiveCategories();

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Error getting active categories:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get active categories" },
      { status: 500 }
    );
  }
}
