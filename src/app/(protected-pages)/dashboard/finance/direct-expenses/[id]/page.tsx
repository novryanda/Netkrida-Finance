/**
 * Finance Direct Expense Detail Page
 */

import { FinanceDirectExpenseDetail } from "@/components/dashboard/finance/direct-expenses/finance-direct-expense-detail";

interface PageProps {
  params: {
    id: string;
  };
}

export default function FinanceDirectExpenseDetailPage({ params }: PageProps) {
  return <FinanceDirectExpenseDetail id={params.id} />;
}
