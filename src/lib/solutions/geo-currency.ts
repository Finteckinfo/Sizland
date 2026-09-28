export const SUPPORTED_CURRENCIES = [
  "KES",
  "USD",
  "EUR",
  "GBP",
  "NGN",
  "ZAR",
  "GHS",
  "UGX",
  "TZS",
  "INR",
  "CAD",
  "AUD",
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

const EU_COUNTRIES = new Set([
  "AT",
  "BE",
  "CY",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PT",
  "SK",
  "SI",
  "ES",
  "HR",
]);

const COUNTRY_CURRENCY: Record<string, SupportedCurrency> = {
  KE: "KES",
  US: "USD",
  GB: "GBP",
  NG: "NGN",
  ZA: "ZAR",
  GH: "GHS",
  UG: "UGX",
  TZ: "TZS",
  IN: "INR",
  CA: "CAD",
  AU: "AUD",
  AE: "USD",
  RW: "USD",
};

export function currencyForCountry(countryCode: string | null | undefined): SupportedCurrency {
  if (!countryCode) return "USD";
  const code = countryCode.toUpperCase();
  if (EU_COUNTRIES.has(code)) return "EUR";
  return COUNTRY_CURRENCY[code] ?? "USD";
}

export function isSupportedCurrency(value: string): value is SupportedCurrency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

export function localeForCurrency(currency: string): string {
  switch (currency) {
    case "KES":
      return "en-KE";
    case "NGN":
      return "en-NG";
    case "GBP":
      return "en-GB";
    case "EUR":
      return "en-IE";
    case "ZAR":
      return "en-ZA";
    case "GHS":
      return "en-GH";
    case "UGX":
      return "en-UG";
    case "TZS":
      return "en-TZ";
    case "INR":
      return "en-IN";
    case "CAD":
      return "en-CA";
    case "AUD":
      return "en-AU";
    default:
      return "en-US";
  }
}

export function formatMoney(
  amount: number,
  currency: string,
  options?: Intl.NumberFormatOptions
): string {
  const maximumFractionDigits =
    amount >= 100 || currency === "UGX" || currency === "TZS" ? 0 : 2;
  try {
    return new Intl.NumberFormat(localeForCurrency(currency), {
      style: "currency",
      currency,
      maximumFractionDigits,
      minimumFractionDigits: maximumFractionDigits === 0 ? 0 : 2,
      ...options,
    }).format(amount);
  } catch {
    return `${amount.toFixed(maximumFractionDigits)} ${currency}`;
  }
}

export function periodSuffix(period: "month" | "year" | "once"): string {
  if (period === "month") return "/mo";
  if (period === "year") return "/yr";
  return "";
}

export type GeoCurrencyResponse = {
  country: string;
  currency: SupportedCurrency;
  rates: Record<string, number>;
  source: "vercel" | "ipwho" | "fallback";
};

let cachedRates: { rates: Record<string, number>; fetchedAt: number } | null =
  null;
const CACHE_MS = 6 * 60 * 60 * 1000;

async function fetchKesRates(): Promise<Record<string, number>> {
  if (cachedRates && Date.now() - cachedRates.fetchedAt < CACHE_MS) {
    return cachedRates.rates;
  }

  const res = await fetch("https://open.er-api.com/v6/latest/KES", {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`FX lookup failed (${res.status})`);
  }
  const data = (await res.json()) as {
    result?: string;
    rates?: Record<string, number>;
  };
  if (data.result !== "success" || !data.rates) {
    throw new Error("FX payload missing rates");
  }
  const rates = { ...data.rates, KES: 1 };
  cachedRates = { rates, fetchedAt: Date.now() };
  return rates;
}

async function countryFromIpWho(ip: string | null): Promise<string | null> {
  const url = ip
    ? `https://ipwho.is/${encodeURIComponent(ip)}`
    : "https://ipwho.is/";
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const data = (await res.json()) as { success?: boolean; country_code?: string };
  if (!data.success || !data.country_code) return null;
  return data.country_code;
}

function clientIpFromRequest(req: {
  headers: { [key: string]: string | string[] | undefined };
}): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (value) return value.split(",")[0]?.trim() || null;
  const realIp = req.headers["x-real-ip"];
  const real = Array.isArray(realIp) ? realIp[0] : realIp;
  return real || null;
}

export async function resolveGeoCurrency(req: {
  headers: { [key: string]: string | string[] | undefined };
}): Promise<GeoCurrencyResponse> {
  const vercelCountryHeader = req.headers["x-vercel-ip-country"];
  const vercelCountry = Array.isArray(vercelCountryHeader)
    ? vercelCountryHeader[0]
    : vercelCountryHeader;

  let country = vercelCountry || null;
  let source: GeoCurrencyResponse["source"] = vercelCountry ? "vercel" : "fallback";

  if (!country) {
    try {
      const fromIp = await countryFromIpWho(clientIpFromRequest(req));
      if (fromIp) {
        country = fromIp;
        source = "ipwho";
      }
    } catch {
      // keep fallback
    }
  }

  if (!country) country = "US";

  let rates: Record<string, number> = { KES: 1 };
  try {
    rates = await fetchKesRates();
  } catch {
    rates = { KES: 1, USD: 1 / 130, EUR: 1 / 150, GBP: 1 / 170, NGN: 12 };
  }

  return {
    country: country.toUpperCase(),
    currency: currencyForCountry(country),
    rates,
    source,
  };
}

export function convertFromKes(
  amountKes: number,
  currency: string,
  rates: Record<string, number>
): number {
  if (currency === "KES") return amountKes;
  const rate = rates[currency];
  if (!rate || !Number.isFinite(rate)) return amountKes;
  return amountKes * rate;
}
