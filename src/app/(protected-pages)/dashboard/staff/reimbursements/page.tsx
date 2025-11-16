/**
 * Staff Reimbursements List Page
 * STAFF dapat melihat semua reimbursement requests mereka
 */

import { Suspense } from "react";
import { StaffReimbursementsList } from "@/components/dashboard/staff/reimbursements/staff-reimbursements-list";

export default function StaffReimbursementsPage() {
  return (
    <Suspense fallback={<div>Loading reimbursements...</div>}>
      <StaffReimbursementsList />
    </Suspense>
  );
}
