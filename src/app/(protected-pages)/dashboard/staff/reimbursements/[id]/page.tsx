/**
 * Staff Reimbursement Detail Page
 * STAFF dapat melihat detail reimbursement request mereka
 */

import { StaffReimbursementDetail } from "@/components/dashboard/staff/reimbursements/staff-reimbursement-detail";

interface PageProps {
  params: {
    id: string;
  };
}

export default function ReimbursementDetailPage({ params }: PageProps) {
  return <StaffReimbursementDetail id={params.id} />;
}
