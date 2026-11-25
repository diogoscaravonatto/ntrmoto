export const NTR_ID_COOKIE = "_ntr_id";
export const NTR_ATTR_COOKIE = "_ntr_attr";
export const NTR_BAR_COOKIE = "_ntr_cookie_bar";
export const CF_CONSENT_COOKIE = "cf_consent";

const TRACKED_ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
] as const;

export type AttributionKey = (typeof TRACKED_ATTRIBUTION_KEYS)[number];
export type AttributionData = Partial<Record<AttributionKey, string>>;

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase();
}

export function buildCookieDomainSuffix(hostname: string, protocol: string): string {
  const host = normalizeHostname(hostname);
  const secure = protocol === "https:" ? "; Secure" : "";
  if (host === "ntrmoto.com.br" || host.endsWith(".ntrmoto.com.br")) {
    return `; Domain=.ntrmoto.com.br; Path=/; SameSite=Lax${secure}`;
  }
  return `; Path=/; SameSite=Lax${secure}`;
}

export function extractAttributionParams(search: string): AttributionData {
  const result: AttributionData = {};
  if (!search) return result;
  const params = new URLSearchParams(search);
  for (const key of TRACKED_ATTRIBUTION_KEYS) {
    const val = params.get(key)?.trim();
    if (val) {
      result[key] = val.slice(0, 256);
    }
  }
  return result;
}

export function mergeAttributionData(
  existing: AttributionData,
  incoming: AttributionData,
): AttributionData {
  return {
    ...existing,
    ...incoming,
  };
}

export function isCheckoutDestination(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  return (
    host === "eduzz.com" ||
    host.endsWith(".eduzz.com") ||
    host === "greenn.com.br" ||
    host.endsWith(".greenn.com.br")
  );
}

export function isLeadDestination(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  return (
    host === "escolademotores.com.br" ||
    host.endsWith(".escolademotores.com.br") ||
    host === "wa.me" ||
    host === "api.whatsapp.com"
  );
}

/**
 * Em `www.ntrmoto.com.br`, apenas cliques comerciais externos (checkout Eduzz/Greenn,
 * WhatsApp ou páginas externas de escolademotores.com.br) disparam `cta_click`.
 * Links internos em `*.ntrmoto.com.br` não devem disparar `Lead` na Meta.
 */
export function isTrackedCtaDestination(hostname: string): boolean {
  return isCheckoutDestination(hostname) || isLeadDestination(hostname);
}

export function isCrossDomainTarget(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  return host === "escolademotores.com.br" || host.endsWith(".escolademotores.com.br");
}

export function decorateCrossDomainUrl(
  rawHref: string,
  baseHref: string,
  ntrId: string,
  attribution: AttributionData,
): string | null {
  try {
    const dest = new URL(rawHref, baseHref);
    if (dest.protocol !== "http:" && dest.protocol !== "https:") return null;
    if (!isCrossDomainTarget(dest.hostname)) return null;

    if (ntrId && !dest.searchParams.has(NTR_ID_COOKIE)) {
      dest.searchParams.set(NTR_ID_COOKIE, ntrId);
    }
    if (attribution.fbclid && !dest.searchParams.has("fbclid")) {
      dest.searchParams.set("fbclid", attribution.fbclid);
    }
    if (attribution.gclid && !dest.searchParams.has("gclid")) {
      dest.searchParams.set("gclid", attribution.gclid);
    }
    // Nunca sobrescreve utm_* já existentes no link
    return dest.toString();
  } catch {
    return null;
  }
}
