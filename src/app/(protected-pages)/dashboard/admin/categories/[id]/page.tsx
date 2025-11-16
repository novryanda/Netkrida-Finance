/**
 * Admin Category Detail Page
 * Shows category details and all expenses in this category
 */

import { CategoryDetailView } from "@/components/dashboard/admin/categories/category-detail-view";

export default function AdminCategoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <CategoryDetailView categoryId={params.id} />;
}
