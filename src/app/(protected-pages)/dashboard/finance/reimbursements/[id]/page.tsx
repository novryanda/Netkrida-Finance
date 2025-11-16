/**
 * Finance Reimbursement Detail Page
 */

import { FinanceReimbursementDetail } from "@/components/dashboard/finance/reimbursements/finance-reimbursement-detail";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function FinanceReimbursementDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <FinanceReimbursementDetail id={id} />;
}
