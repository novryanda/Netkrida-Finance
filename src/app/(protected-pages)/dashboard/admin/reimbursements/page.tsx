/**
 * Admin Reimbursement Approvals Page
 */
import { Suspense } from "react";
import { AdminReimbursementApprovals } from "@/components/dashboard/admin/reimbursements/admin-reimbursement-approvals";

export default function AdminReimbursementsPage() {
  return (
    <Suspense fallback={<div>Loading reimbursements...</div>}>
      <AdminReimbursementApprovals />
    </Suspense>
  );
}
