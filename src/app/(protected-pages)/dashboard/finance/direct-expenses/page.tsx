/**
 * Finance Direct Expenses Page
 */
import { Suspense } from "react";
import { FinanceDirectExpensesList } from "@/components/dashboard/finance/direct-expenses/finance-direct-expenses-list";

export default function FinanceDirectExpensesPage() {
  return (
    <Suspense fallback={<div>Loading direct expenses...</div>}>
      <FinanceDirectExpensesList />
    </Suspense>
  );
}
