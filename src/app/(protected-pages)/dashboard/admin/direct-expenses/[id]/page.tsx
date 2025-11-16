/**
 * Admin Direct Expense Detail Page
 */

import { AdminDirectExpenseDetail } from "@/components/dashboard/admin/direct-expenses/admin-direct-expense-detail";

export default function AdminDirectExpenseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <AdminDirectExpenseDetail id={params.id} />;
}
