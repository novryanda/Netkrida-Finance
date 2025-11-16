/**
 * Finance Reimbursements Page
 */
import { Suspense } from "react";
import { FinanceReimbursementsList } from "@/components/dashboard/finance/reimbursements/finance-reimbursements-list";

export default function FinanceReimbursementsPage() {
  return (
    <Suspense fallback={<div>Loading reimbursements...</div>}>
      <FinanceReimbursementsList />
    </Suspense>
  );
}
