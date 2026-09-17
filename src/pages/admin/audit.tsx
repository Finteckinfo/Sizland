'use client';

import { BuyAdminLayout } from '@/components/buy/buy-admin-layout';
import { AdminComingSoon } from '@/components/buy/admin-coming-soon';

export default function AdminAuditPage() {
  return (
    <BuyAdminLayout title="Audit — buy.siz.land admin">
      <AdminComingSoon
        title="Audit log"
        summary="Publishes, rejects, status moves, and document uploads happen, but they are not listed as an operator-facing history yet."
        later={[
          'Who published or rejected an upload, and why',
          'Who moved a deal to diligence / completed / cancelled',
          'Who granted isLandAdmin',
          'Export a trail without opening Postgres',
        ]}
      />
    </BuyAdminLayout>
  );
}
