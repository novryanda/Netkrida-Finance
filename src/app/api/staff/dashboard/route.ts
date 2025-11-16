import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { DashboardService } from "@/server/service/dashboard.service";

const dashboardService = new DashboardService();

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await dashboardService.getStaffDashboardData(session.user.id);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching staff dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
