'use client';

import { BuyDashboardLayout } from '@/components/buy/buy-dashboard-layout';
import { CatalogExplorer } from '@/components/buy/catalog-explorer';

export default function DashboardCatalogPage() {
  return (
    <BuyDashboardLayout title="Catalog — buy.siz.land">
      <CatalogExplorer embedded />
    </BuyDashboardLayout>
  );
}
