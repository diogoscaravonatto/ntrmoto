export const NTR_ID_COOKIE = "_ntr_id";
export const NTR_ATTR_COOKIE = "_ntr_attr";
export const NTR_FIRST_TOUCH_COOKIE = "_ntr_ft";
export const NTR_JOURNEY_KEY = "_ntr_journey";
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

export interface FirstTouchData {
  source: string;
  medium: string;
  campaign?: string;
  content?: string;
  term?: string;
  landing_path: string;
  referrer_host?: string;
  ts: number;
}

export interface LeadPiiInput {
  name?: string;
  email?: string;
  phone?: string;
}

export interface NormalizedLeadPii {
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
}

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

export function inferTouchFromContext(
  search: string,
  referrer: string,
  pathname: string,
  now = Date.now(),
): FirstTouchData {
  const params = extractAttributionParams(search);
  const landingPath = (pathname || "/").slice(0, 256);

  let referrerHost = "";
  if (referrer) {
    try {
      const refUrl = new URL(referrer);
      const host = refUrl.hostname.toLowerCase();
      const isInternal =
        host === "ntrmoto.com.br" ||
        host.endsWith(".ntrmoto.com.br") ||
        host === "localhost" ||
        host === "127.0.0.1";
      if (!isInternal) {
        referrerHost = host.replace(/^www\./, "");
      }
    } catch {
      referrerHost = "";
    }
  }

  const base: FirstTouchData = {
    source: "direct",
    medium: "none",
    landing_path: landingPath,
    ts: now,
  };

  if (referrerHost) {
    base.referrer_host = referrerHost;
  }

  if (params.utm_source) {
    base.source = params.utm_source;
    base.medium = params.utm_medium || "unknown";
    if (params.utm_campaign) base.campaign = params.utm_campaign;
    if (params.utm_content) base.content = params.utm_content;
    if (params.utm_term) base.term = params.utm_term;
    return base;
  }

  if (params.fbclid) {
    base.source = "facebook";
    base.medium = "cpc";
    return base;
  }

  if (params.gclid) {
    base.source = "google";
    base.medium = "cpc";
    return base;
  }

  if (referrerHost) {
    if (
      referrerHost === "google.com" ||
      referrerHost.startsWith("google.") ||
      referrerHost.includes(".google.")
    ) {
      if (referrerHost === "gemini.google.com") {
        base.source = "gemini.google.com";
        base.medium = "ai_referral";
      } else {
        base.source = "google";
        base.medium = "organic";
      }
      return base;
    }
    if (
      referrerHost === "bing.com" ||
      referrerHost.endsWith(".bing.com") ||
      referrerHost === "duckduckgo.com" ||
      referrerHost === "yahoo.com" ||
      referrerHost.endsWith(".yahoo.com")
    ) {
      base.source = referrerHost;
      base.medium = "organic";
      return base;
    }
    if (
      referrerHost === "youtube.com" ||
      referrerHost.endsWith(".youtube.com") ||
      referrerHost === "youtu.be"
    ) {
      base.source = "youtube";
      base.medium = "video";
      return base;
    }
    if (referrerHost === "instagram.com" || referrerHost.endsWith(".instagram.com")) {
      base.source = "instagram";
      base.medium = "social";
      return base;
    }
    if (
      referrerHost === "facebook.com" ||
      referrerHost.endsWith(".facebook.com") ||
      referrerHost === "fb.com"
    ) {
      base.source = "facebook";
      base.medium = "social";
      return base;
    }
    if (
      referrerHost === "chatgpt.com" ||
      referrerHost === "chat.openai.com" ||
      referrerHost === "perplexity.ai" ||
      referrerHost === "claude.ai"
    ) {
      base.source = referrerHost;
      base.medium = "ai_referral";
      return base;
    }

    base.source = referrerHost;
    base.medium = "referral";
  }

  return base;
}

export function generateEventId(prefix = "ntr"): string {
  const safePrefix = prefix.replace(/[^a-z0-9_-]/gi, "").slice(0, 12) || "ntr";
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${safePrefix}_${crypto.randomUUID()}`;
  }
  return `${safePrefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeLeadPii(input: LeadPiiInput): NormalizedLeadPii {
  const out: NormalizedLeadPii = {};
  const email = input.email?.trim().toLowerCase() ?? "";
  if (email && email.includes("@")) {
    out.em = email;
  }

  const digits = (input.phone ?? "").replace(/\D/g, "");
  if (digits.length >= 10) {
    out.ph = digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
  }

  const nameParts = (input.name ?? "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (nameParts.length >= 1) {
    out.fn = nameParts[0];
  }
  if (nameParts.length >= 2) {
    out.ln = nameParts[nameParts.length - 1];
  }

  return out;
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

export function detectInAppBrowser(userAgent: string): string {
  const ua = userAgent || "";
  if (/instagram/i.test(ua)) return "instagram";
  if (/fban|fbav|fb_iab|facebook/i.test(ua)) return "facebook";
  if (/musical_ly|tiktok|bytedance/i.test(ua)) return "tiktok";
  if (/whatsapp/i.test(ua)) return "whatsapp";
  if (/linkedinapp/i.test(ua)) return "linkedin";
  if (/;\s*wv\)/i.test(ua)) return "webview";
  return "browser";
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

/**
 * Propaga atribuição (`utm_*`, `fbclid`, `gclid`) e `_ntr_id` para checkouts Eduzz/Greenn,
 * preservando integralmente parâmetros existentes como `cupom`, `u`, `dv` e `utm_*` explícitos.
 */
export function decorateCheckoutUrl(
  rawHref: string,
  baseHref: string,
  ntrId: string,
  attribution: AttributionData,
  firstTouch?: FirstTouchData | null,
): string | null {
  try {
    const dest = new URL(rawHref, baseHref);
    if (dest.protocol !== "http:" && dest.protocol !== "https:") return null;
    if (!isCheckoutDestination(dest.hostname)) return null;

    const utmSource =
      attribution.utm_source ||
      (firstTouch?.source && firstTouch.source !== "direct" ? firstTouch.source : "");
    const utmMedium =
      attribution.utm_medium ||
      (firstTouch?.medium && firstTouch.medium !== "none" ? firstTouch.medium : "");
    const utmCampaign = attribution.utm_campaign || firstTouch?.campaign || "";
    const utmContent = attribution.utm_content || firstTouch?.content || "";
    const utmTerm = attribution.utm_term || firstTouch?.term || "";

    if (utmSource && !dest.searchParams.has("utm_source")) {
      dest.searchParams.set("utm_source", utmSource);
    }
    if (utmMedium && !dest.searchParams.has("utm_medium")) {
      dest.searchParams.set("utm_medium", utmMedium);
    }
    if (utmCampaign && !dest.searchParams.has("utm_campaign")) {
      dest.searchParams.set("utm_campaign", utmCampaign);
    }
    if (utmContent && !dest.searchParams.has("utm_content")) {
      dest.searchParams.set("utm_content", utmContent);
    }
    if (utmTerm && !dest.searchParams.has("utm_term")) {
      dest.searchParams.set("utm_term", utmTerm);
    }
    if (attribution.fbclid && !dest.searchParams.has("fbclid")) {
      dest.searchParams.set("fbclid", attribution.fbclid);
    }
    if (attribution.gclid && !dest.searchParams.has("gclid")) {
      dest.searchParams.set("gclid", attribution.gclid);
    }
    if (ntrId && !dest.searchParams.has(NTR_ID_COOKIE)) {
      dest.searchParams.set(NTR_ID_COOKIE, ntrId);
    }

    return dest.toString();
  } catch {
    return null;
  }
}
