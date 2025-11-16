
import { Suspense } from "react";
import { AdminDirectExpenseApprovals } from "@/components/dashboard/admin/direct-expenses/admin-direct-expense-approvals";

export default function AdminDirectExpensesPage() {
  return (
    <Suspense fallback={<div>Loading direct expenses...</div>}>
      <AdminDirectExpenseApprovals />
    </Suspense>
  );
}
