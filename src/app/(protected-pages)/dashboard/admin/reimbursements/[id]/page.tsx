/**
 * Admin Reimbursement Detail Page
 * Page untuk melihat detail dan approve/reject reimbursement
 */

import { AdminReimbursementDetail } from "@/components/dashboard/admin/reimbursements/admin-reimbursement-detail";

export default function AdminReimbursementDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <AdminReimbursementDetail id={params.id} />;
}
