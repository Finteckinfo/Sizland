'use client';

import { BuyAdminLayout } from '@/components/buy/buy-admin-layout';
import { AdminComingSoon } from '@/components/buy/admin-coming-soon';

export default function AdminMessagesPage() {
  return (
    <BuyAdminLayout title="Messages — buy.siz.land admin">
      <AdminComingSoon
        title="Buyer messages"
        summary="Status changes and new diligence files already create in-app notifications. There is no operator inbox to write a note to a pairwise buyer yet."
        later={[
          'Message a deal without needing the buyer’s email from OIDC (they may not have one)',
          'Use the contact email they typed on profile, not the SizWallet login',
          'Keep DID and wallet addresses out of this thread',
          'See unread client replies next to the deal, not in a generic mail client',
        ]}
      />
    </BuyAdminLayout>
  );
}
