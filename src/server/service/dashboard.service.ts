import { DashboardRepository } from "@/server/repositories/dashboard.repository";

export class DashboardService {
  private dashboardRepository: DashboardRepository;

  constructor() {
    this.dashboardRepository = new DashboardRepository();
  }

  // ============================================
  // ADMIN DASHBOARD SERVICES
  // ============================================

  async getAdminDashboardData() {
    const [
      overview,
      monthlyExpenses,
      expensesByCategory,
      projectStatus,
      topProjects,
      recentActivities,
    ] = await Promise.all([
      this.dashboardRepository.getAdminOverview(),
      this.dashboardRepository.getMonthlyExpensesTrend(6),
      this.dashboardRepository.getExpensesByCategory(),
      this.dashboardRepository.getProjectStatusDistribution(),
      this.dashboardRepository.getTopExpenseProjects(5),
      this.dashboardRepository.getRecentActivities(10),
    ]);

    return {
      overview,
      monthlyExpenses,
      expensesByCategory,
      projectStatus,
      topProjects,
      recentActivities,
    };
  }

  async getAdminOverview() {
    return this.dashboardRepository.getAdminOverview();
  }

  async getMonthlyExpensesTrend(months: number = 6) {
    return this.dashboardRepository.getMonthlyExpensesTrend(months);
  }

  async getExpensesByCategory() {
    return this.dashboardRepository.getExpensesByCategory();
  }

  async getProjectStatusDistribution() {
    return this.dashboardRepository.getProjectStatusDistribution();
  }

  async getTopExpenseProjects(limit: number = 5) {
    return this.dashboardRepository.getTopExpenseProjects(limit);
  }

  async getRecentActivities(limit: number = 10) {
    return this.dashboardRepository.getRecentActivities(limit);
  }

  // ============================================
  // FINANCE DASHBOARD SERVICES
  // ============================================

  async getFinanceDashboardData() {
    const [
      overview,
      approvedReimbursements,
      approvedDirectExpenses,
      recentPayments,
      paymentTrend,
    ] = await Promise.all([
      this.dashboardRepository.getFinanceOverview(),
      this.dashboardRepository.getApprovedReimbursements(10),
      this.dashboardRepository.getApprovedDirectExpenses(10),
      this.dashboardRepository.getRecentPayments(10),
      this.dashboardRepository.getPaymentTrend(6),
    ]);

    return {
      overview,
      approvedReimbursements,
      approvedDirectExpenses,
      recentPayments,
      paymentTrend,
    };
  }

  async getFinanceOverview() {
    return this.dashboardRepository.getFinanceOverview();
  }

  async getApprovedReimbursements(limit?: number) {
    return this.dashboardRepository.getApprovedReimbursements(limit);
  }

  async getApprovedDirectExpenses(limit?: number) {
    return this.dashboardRepository.getApprovedDirectExpenses(limit);
  }

  async getRecentPayments(limit: number = 10) {
    return this.dashboardRepository.getRecentPayments(limit);
  }

  async getPaymentTrend(months: number = 6) {
    return this.dashboardRepository.getPaymentTrend(months);
  }

  // ============================================
  // STAFF DASHBOARD SERVICES
  // ============================================

  async getStaffDashboardData(userId: string) {
    const [
      overview,
      reimbursements,
      reimbursementsByStatus,
      monthlyReimbursements,
      bankInfo,
    ] = await Promise.all([
      this.dashboardRepository.getStaffOverview(userId),
      this.dashboardRepository.getStaffReimbursements(userId, 10),
      this.dashboardRepository.getStaffReimbursementsByStatus(userId),
      this.dashboardRepository.getStaffMonthlyReimbursements(userId, 6),
      this.dashboardRepository.getStaffBankInfo(userId),
    ]);

    return {
      overview,
      reimbursements,
      reimbursementsByStatus,
      monthlyReimbursements,
      bankInfo,
    };
  }

  async getStaffOverview(userId: string) {
    return this.dashboardRepository.getStaffOverview(userId);
  }

  async getStaffReimbursements(userId: string, limit?: number) {
    return this.dashboardRepository.getStaffReimbursements(userId, limit);
  }

  async getStaffReimbursementsByStatus(userId: string) {
    return this.dashboardRepository.getStaffReimbursementsByStatus(userId);
  }

  async getStaffMonthlyReimbursements(userId: string, months: number = 6) {
    return this.dashboardRepository.getStaffMonthlyReimbursements(userId, months);
  }

  async getStaffBankInfo(userId: string) {
    return this.dashboardRepository.getStaffBankInfo(userId);
  }
}
