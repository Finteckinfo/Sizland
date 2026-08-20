"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MyTabLayout } from "@/components/mytab/layout/mytab-layout";
import { BalancePill } from "@/components/mytab/dashboard/balance-pill";
import { AggregatedBalance } from "@/components/mytab/dashboard/aggregated-balance";
import { RequestForm } from "@/components/mytab/dashboard/request-form";
import { PledgeQueue } from "@/components/mytab/dashboard/pledge-queue";
import { MaturityTimeline } from "@/components/mytab/timeline/maturity-timeline";
import { fetchIncomingPledges, fetchBalance } from "@/lib/mytab/pledge-client";
import type { PledgeView } from "@/lib/mytab/pledge-client";
import {
  fetchAggregatedBalance,
  fetchTimeline,
} from "@/lib/mytab/indexer-client";
import type { TimelineEntry } from "@/lib/mytab/indexer-client";
import {
  getStoredAlias,
  isPhoneVerified,
  isProfileComplete,
} from "@/lib/mytab/profile-store";

export default function MyTabDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alias, setAlias] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [balance, setBalance] = useState({ amount: 0, currency: "KES" });
  const [aggregated, setAggregated] = useState({
    expectedIn: 0,
    goingOut: 0,
    currency: "KES",
  });
  const [pledges, setPledges] = useState<PledgeView[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);

  useEffect(() => {
    setMounted(true);

    if (!isProfileComplete()) {
      router.replace("/mytab/onboarding");
      return;
    }

    setAlias(getStoredAlias());
    setPhoneVerified(isPhoneVerified());

    async function loadDashboard() {
      setLoading(true);
      try {
        const [balanceData, aggData, pledgeData, timelineData] =
          await Promise.all([
            fetchBalance(),
            fetchAggregatedBalance(),
            fetchIncomingPledges(),
            fetchTimeline(),
          ]);
        setBalance(balanceData);
        setAggregated(aggData);
        setPledges(pledgeData);
        setTimeline(timelineData);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  if (!mounted) return null;

  return (
    <MyTabLayout alias={alias} phoneVerified={phoneVerified}>
      <BalancePill amount={balance.amount} currency={balance.currency} />
      <AggregatedBalance
        expectedIn={aggregated.expectedIn}
        goingOut={aggregated.goingOut}
        currency={aggregated.currency}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
        <RequestForm />
        <PledgeQueue pledges={pledges} loading={loading} />
      </div>

      <div className="mt-8 lg:mt-12">
        <MaturityTimeline entries={timeline} loading={loading} />
      </div>
    </MyTabLayout>
  );
}
