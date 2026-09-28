import { useCallback, useEffect, useMemo, useState } from "react";
import {
  convertFromKes,
  formatMoney,
  isSupportedCurrency,
  periodSuffix,
  type GeoCurrencyResponse,
  type SupportedCurrency,
  SUPPORTED_CURRENCIES,
} from "@/lib/solutions/geo-currency";

const STORAGE_KEY = "sizland.solutions.currency";

export function useGeoCurrency() {
  const [payload, setPayload] = useState<GeoCurrencyResponse | null>(null);
  const [currency, setCurrencyState] = useState<SupportedCurrency>("KES");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const stored =
      typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;

    (async () => {
      try {
        const res = await fetch("/api/solutions/geo-currency");
        if (!res.ok) throw new Error("geo-currency failed");
        const data = (await res.json()) as GeoCurrencyResponse;
        if (cancelled) return;
        setPayload(data);
        if (stored && isSupportedCurrency(stored)) {
          setCurrencyState(stored);
        } else {
          setCurrencyState(data.currency);
        }
      } catch {
        if (!cancelled) {
          setPayload({
            country: "KE",
            currency: "KES",
            rates: { KES: 1 },
            source: "fallback",
          });
          setCurrencyState(
            stored && isSupportedCurrency(stored) ? stored : "KES"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = useCallback((next: SupportedCurrency) => {
    setCurrencyState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore quota / private mode
    }
  }, []);

  const rates = payload?.rates ?? { KES: 1 };

  const formatKes = useCallback(
    (amountKes: number, period?: "month" | "year" | "once") => {
      const converted = convertFromKes(amountKes, currency, rates);
      const label = formatMoney(converted, currency);
      return period ? `${label}${periodSuffix(period)}` : label;
    },
    [currency, rates]
  );

  const convertKes = useCallback(
    (amountKes: number) => convertFromKes(amountKes, currency, rates),
    [currency, rates]
  );

  const currencies = useMemo(() => {
    const extra = payload?.currency;
    if (extra && !SUPPORTED_CURRENCIES.includes(extra)) {
      return [...SUPPORTED_CURRENCIES, extra] as SupportedCurrency[];
    }
    return [...SUPPORTED_CURRENCIES];
  }, [payload?.currency]);

  return {
    currency,
    setCurrency,
    country: payload?.country ?? "KE",
    rates,
    loading,
    formatKes,
    convertKes,
    currencies,
  };
}

export type GeoCurrencyHook = ReturnType<typeof useGeoCurrency>;
