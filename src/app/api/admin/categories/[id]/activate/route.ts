/**
 * API Route: /api/admin/categories/[id]/activate
 * Activate category
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { categoryService } from "@/server/service/admin/category.service";
import { UserRole } from "@/server/schema/enums";

/**
 * POST /api/admin/categories/[id]/activate
 * Activate category
 * @access ADMIN only
 */
export async function POST(
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
        { error: "Forbidden: Only ADMIN can activate categories" },
        { status: 403 }
      );
    }

    const category = await categoryService.activateCategory(params.id);

    return NextResponse.json({
      message: "Category activated successfully",
      category,
    });
  } catch (error: any) {
    console.error("Error activating category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to activate category" },
      { status: 500 }
    );
  }
}
