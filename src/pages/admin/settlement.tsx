'use client';

import { BuyAdminLayout } from '@/components/buy/buy-admin-layout';
import { AdminComingSoon } from '@/components/buy/admin-coming-soon';

export default function AdminSettlementPage() {
  return (
    <BuyAdminLayout title="Settlement — buy.siz.land admin">
      <AdminComingSoon
        title="Settlement"
        summary="Pilot deals can record a SizWallet settlement stub on the client deal page. Live escrow, funding proofs, and release conditions are not wired yet."
        later={[
          'See which deals have a recorded vs funded settlement',
          'Match amount to the reserved listing price',
          'Release or cancel without talking to a chain explorer by hand',
          'Real on-chain escrow when that product is ready — not paste-a-tx as login',
        ]}
      />
    </BuyAdminLayout>
  );
}
