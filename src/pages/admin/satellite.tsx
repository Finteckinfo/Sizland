'use client';

import { BuyAdminLayout } from '@/components/buy/buy-admin-layout';
import { AdminComingSoon } from '@/components/buy/admin-coming-soon';

export default function AdminSatellitePage() {
  return (
    <BuyAdminLayout title="Satellite — buy.siz.land admin">
      <AdminComingSoon
        title="Satellite & EO"
        summary="Listings can already store coordinates. Live Copernicus / drone jobs, scene dates, and change detection are not an operator console yet."
        later={[
          'Queue a scene for a published or reserved parcel',
          'See last imagery date and STABLE vs cleared vs construction',
          'Attach a verified thumbnail to the listing the buyer already selected',
          'Do this without exposing raw EO credentials to the client app',
        ]}
      />
    </BuyAdminLayout>
  );
}
