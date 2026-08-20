import { MYTAB_URL, BUY_LAND_URL } from "@/lib/external-apps";

const MAIN_ORIGINS = ["https://siz.land", "https://www.siz.land"];

/** Allowed post-auth redirect targets for MyTab and shared auth flows. */
export function isAllowedAuthRedirect(url: string, baseUrl: string): boolean {
  try {
    const parsed = new URL(url, baseUrl);
    const origin = parsed.origin;

    if (origin === baseUrl.replace(/\/$/, "") || origin === new URL(baseUrl).origin) {
      return true;
    }

    const allowedOrigins = [
      ...MAIN_ORIGINS,
      MYTAB_URL,
      BUY_LAND_URL,
      process.env.NEXT_PUBLIC_SOLUTIONS_URL?.replace(/\/$/, "") ||
        "https://solutions.siz.land",
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) return true;

    // Local dev
    if (
      process.env.NODE_ENV === "development" &&
      (origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:"))
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export function resolveAuthRedirect(url: string, baseUrl: string): string {
  if (url.startsWith("/") && !url.startsWith("//")) {
    return `${baseUrl}${url}`;
  }
  if (isAllowedAuthRedirect(url, baseUrl)) {
    return url;
  }
  return `${baseUrl}/lobby`;
}
