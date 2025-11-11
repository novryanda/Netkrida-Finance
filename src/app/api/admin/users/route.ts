/**
 * Admin Users API Routes
 * GET /api/admin/users - Get all users
 * POST /api/admin/users - Create new user
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { adminUserService } from "@/server/service/admin/user.service";
import { CreateUserSchema } from "@/server/schema";
import { UserRole } from "@/server/schema/enums";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const role = searchParams.get("role") || undefined;
    const isActive = searchParams.get("isActive")
      ? searchParams.get("isActive") === "true"
      : undefined;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // Get users
    const result = await adminUserService.getAllUsers({
      page,
      limit,
      search,
      role,
      isActive,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreateUserSchema.parse(body);

    // Create user
    const user = await adminUserService.createUser(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    
    if (error instanceof Error && error.message === "Email already exists") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create user",
      },
      { status: 500 }
    );
  }
}
