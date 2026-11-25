import { EDUZZ_OFFERS_BY_ID, OFFERS_BY_SLUG } from "./catalog";
import {
  CF_CONSENT_COOKIE,
  NTR_ATTR_COOKIE,
  NTR_BAR_COOKIE,
  NTR_FIRST_TOUCH_COOKIE,
  NTR_ID_COOKIE,
  NTR_JOURNEY_KEY,
} from "./tracking";

function safeJsonForInlineScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/**
 * IIFE síncrona para `<head>`: garante que o UUID `_ntr_id` exista em
 * `Domain=.ntrmoto.com.br` (ou host atual em dev) antes do `Pageview` do Zaraz.
 */
export function buildNtrIdHeadBootstrapScript(): string {
  const idCookieJson = safeJsonForInlineScript(NTR_ID_COOKIE);
  return `(() => {
  try {
    const ntrIdCookieName = ${idCookieJson};
    const getCookie = (name) => {
      const prefix = \`\${name}=\`;
      for (const part of document.cookie.split(";")) {
        const item = part.trim();
        if (item.startsWith(prefix)) return decodeURIComponent(item.slice(prefix.length));
      }
      return "";
    };
    let ntrId = getCookie(ntrIdCookieName);
    if (!ntrId) {
      try {
        ntrId = localStorage.getItem(ntrIdCookieName) || "";
      } catch {
        ntrId = "";
      }
    }
    if (!ntrId) {
      ntrId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : \`\${Date.now().toString(36)}-\${Math.random().toString(36).slice(2, 10)}\`;
    }
    const host = window.location.hostname.toLowerCase();
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    const domain =
      host === "ntrmoto.com.br" || host.endsWith(".ntrmoto.com.br")
        ? "; Domain=.ntrmoto.com.br"
        : "";
    document.cookie = \`\${ntrIdCookieName}=\${encodeURIComponent(ntrId)}\${domain}; Path=/; SameSite=Lax\${secure}; Max-Age=31536000\`;
    try {
      localStorage.setItem(ntrIdCookieName, ntrId);
    } catch {
      // Ignora erro caso localStorage esteja indisponível
    }
  } catch {
    // Ignora erro de cookie em ambientes restritos
  }
})();`;
}

/**
 * IIFE síncrona para início do `<body>`: define idioma `pt-BR` e estado inicial
 * do Google Consent Mode v2 (`granted`) quando `cf_consent` ainda não existir.
 */
export function buildZarazConsentDefaultScript(): string {
  const consentCookiePrefix = safeJsonForInlineScript(`${CF_CONSENT_COOKIE}=`);
  return `(() => {
  try {
    const z = window.zaraz;
    if (!z || typeof z.set !== "function") return;
    z.set("__zarazConsentLanguage", "pt-BR");
    const prefix = ${consentCookiePrefix};
    if (!document.cookie.split(";").some((p) => p.trim().startsWith(prefix))) {
      z.set("google_consent_default", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
        analytics_storage: "granted",
      });
    }
  } catch {
    // Ignora erro caso zaraz ou cookies não estejam disponíveis
  }
})();`;
}

export interface LegacyZarazOptions {
  contentType?: string;
  contentSlug?: string;
}

/**
 * Gera bloco autocontido (CSS escopado + barra discreta de rodapé + `#ntr-cb` + script JS)
 * para páginas legadas importadas do SwipePages. Nunca é injetado nos `/embed*`.
 */
export function buildLegacyZarazFooterAndBannerHtml(opts: LegacyZarazOptions = {}): string {
  const contentTypeJson = safeJsonForInlineScript(opts.contentType ?? "");
  const contentSlugJson = safeJsonForInlineScript(opts.contentSlug ?? "");
  const ntrIdJson = safeJsonForInlineScript(NTR_ID_COOKIE);
  const ntrAttrJson = safeJsonForInlineScript(NTR_ATTR_COOKIE);
  const firstTouchJson = safeJsonForInlineScript(NTR_FIRST_TOUCH_COOKIE);
  const journeyKeyJson = safeJsonForInlineScript(NTR_JOURNEY_KEY);
  const barCookieJson = safeJsonForInlineScript(NTR_BAR_COOKIE);
  const consentCookieJson = safeJsonForInlineScript(CF_CONSENT_COOKIE);
  const eduzzOffersJson = safeJsonForInlineScript(EDUZZ_OFFERS_BY_ID);
  const slugOffersJson = safeJsonForInlineScript(OFFERS_BY_SLUG);

  return `
<style>
  .ntr-cookie-footer-bar {
    background: #050505;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    color: #9ca3af;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 12px;
    line-height: 1.5;
    padding: 16px;
    text-align: center;
  }
  .ntr-cookie-footer-bar__inner {
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 8px 16px;
  }
  .ntr-cookie-footer-bar__btn,
  .ntr-cookie-footer-bar__link {
    background: none;
    border: 0;
    padding: 0;
    color: #d1d5db;
    font: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
  }
  .ntr-cookie-footer-bar__btn:hover,
  .ntr-cookie-footer-bar__link:hover {
    color: #ffffff;
  }
  .ntr-cb[hidden],
  .ntr-cb [hidden] {
    display: none !important;
  }
  .ntr-cb {
    position: fixed;
    right: 16px;
    bottom: 16px;
    max-width: 440px;
    z-index: 9999;
    background: #0f1117;
    color: #f4f6fa;
    border: 1px solid #222735;
    border-radius: 10px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 13px;
    line-height: 1.45;
    padding: 12px 14px;
    box-sizing: border-box;
    text-align: left;
  }
  .ntr-cb__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .ntr-cb__text {
    margin: 0;
    color: #f4f6fa;
    flex: 1;
  }
  .ntr-cb__link,
  .ntr-cb__link-btn {
    background: none;
    border: 0;
    padding: 0;
    font-family: inherit;
    font-size: 12px;
    color: #a6adbd;
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
    transition: color 0.15s ease;
  }
  .ntr-cb__link:hover,
  .ntr-cb__link-btn:hover {
    color: #f4f6fa;
  }
  .ntr-cb__actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  .ntr-cb__ok {
    background: #c81e1e;
    color: #ffffff;
    border: 0;
    border-radius: 6px;
    padding: 6px 14px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.2;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }
  .ntr-cb__ok:hover {
    background: #991b1b;
  }
  .ntr-cb__prefs-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    font-weight: 600;
    color: #f4f6fa;
  }
  .ntr-cb__opt {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 6px;
    cursor: pointer;
    color: #f4f6fa;
    font-size: 12.5px;
  }
  .ntr-cb__opt input {
    margin-top: 2px;
    accent-color: #ef4444;
    cursor: pointer;
  }
  .ntr-cb__sub {
    color: #a6adbd;
  }
  .ntr-cb__prefs-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 10px;
  }
  @media (max-width: 640px) {
    .ntr-cb {
      left: 12px;
      right: 12px;
      bottom: 12px;
      max-width: none;
    }
    .ntr-cb__row {
      flex-direction: column;
      align-items: flex-start;
    }
    .ntr-cb__actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
</style>
<div class="ntr-cookie-footer-bar">
  <div class="ntr-cookie-footer-bar__inner">
    <span>NTR Escola de Motores</span>
    <span aria-hidden="true">·</span>
    <a href="https://blog.ntrmoto.com.br/pages/privacidade" target="_blank" rel="noopener noreferrer" class="ntr-cookie-footer-bar__link">Política de Privacidade</a>
    <span aria-hidden="true">·</span>
    <button type="button" class="ntr-cookie-footer-bar__btn" data-cookie-preferences>Preferências de cookies</button>
  </div>
</div>
<div id="ntr-cb" class="ntr-cb" role="region" aria-label="Preferências de cookies" hidden>
  <div id="ntr-cb-main" class="ntr-cb__row">
    <p class="ntr-cb__text">
      Usamos cookies para melhorar sua experiência e medir resultados.
      <a href="https://blog.ntrmoto.com.br/pages/privacidade" target="_blank" rel="noopener noreferrer" class="ntr-cb__link">Privacidade</a>
    </p>
    <div class="ntr-cb__actions">
      <button type="button" id="ntr-cb-cfg" class="ntr-cb__link-btn">Configurar</button>
      <button type="button" id="ntr-cb-ok" class="ntr-cb__ok">OK</button>
    </div>
  </div>
  <div id="ntr-cb-prefs" class="ntr-cb__prefs" hidden>
    <div class="ntr-cb__prefs-head">
      <span>Preferências de cookies</span>
      <button type="button" id="ntr-cb-close" class="ntr-cb__link-btn">Fechar</button>
    </div>
    <label for="ntr-cb-chk-analytics" class="ntr-cb__opt">
      <input type="checkbox" id="ntr-cb-chk-analytics" checked />
      <span><strong>Análise e Desempenho</strong> <span class="ntr-cb__sub">— Google Analytics 4</span></span>
    </label>
    <label for="ntr-cb-chk-marketing" class="ntr-cb__opt">
      <input type="checkbox" id="ntr-cb-chk-marketing" checked />
      <span><strong>Marketing e Conversões</strong> <span class="ntr-cb__sub">— Meta</span></span>
    </label>
    <div class="ntr-cb__prefs-foot">
      <button type="button" id="ntr-cb-reject" class="ntr-cb__link-btn">Rejeitar opcionais</button>
      <button type="button" id="ntr-cb-save" class="ntr-cb__ok">Salvar</button>
    </div>
  </div>
</div>
<script>
(() => {
  const win = window;
  if (win.__ntrZarazInit) return;
  win.__ntrZarazInit = true;

  const NTR_ID_COOKIE = ${ntrIdJson};
  const NTR_ATTR_COOKIE = ${ntrAttrJson};
  const NTR_FT_COOKIE = ${firstTouchJson};
  const NTR_JOURNEY_KEY = ${journeyKeyJson};
  const BAR_COOKIE = ${barCookieJson};
  const CONSENT_COOKIE = ${consentCookieJson};
  const CONTENT_TYPE = ${contentTypeJson};
  const CONTENT_SLUG = ${contentSlugJson};
  const EDUZZ_OFFERS = ${eduzzOffersJson};
  const SLUG_OFFERS = ${slugOffersJson};
  const ATTR_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"];

  function buildCookieDomainSuffix() {
    const host = win.location.hostname.toLowerCase();
    const secure = win.location.protocol === "https:" ? "; Secure" : "";
    if (host === "ntrmoto.com.br" || host.endsWith(".ntrmoto.com.br")) {
      return "; Domain=.ntrmoto.com.br; Path=/; SameSite=Lax" + secure;
    }
    return "; Path=/; SameSite=Lax" + secure;
  }

  function hasCookie(name) {
    const prefix = name + "=";
    return document.cookie.split(";").some((part) => part.trim().startsWith(prefix));
  }

  function readCookie(name) {
    const prefix = name + "=";
    for (const part of document.cookie.split(";")) {
      const trimmed = part.trim();
      if (trimmed.startsWith(prefix)) {
        try {
          return decodeURIComponent(trimmed.slice(prefix.length));
        } catch {
          return "";
        }
      }
    }
    return "";
  }

  function writeCookie(name, value, maxAgeSeconds) {
    try {
      document.cookie = name + "=" + encodeURIComponent(value) + buildCookieDomainSuffix() + "; Max-Age=" + maxAgeSeconds;
    } catch {
      // Ignora erro caso cookies estejam bloqueados
    }
  }

  function generateEventId(prefix) {
    const p = (prefix || "ntr").replace(/[^a-z0-9_-]/gi, "").slice(0, 12) || "ntr";
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return p + "_" + crypto.randomUUID();
    }
    return p + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
  }

  function getOrCreateNtrId() {
    let id = readCookie(NTR_ID_COOKIE);
    if (!id) {
      try {
        id = localStorage.getItem(NTR_ID_COOKIE) || "";
      } catch {
        id = "";
      }
    }
    if (!id) {
      id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
    }
    writeCookie(NTR_ID_COOKIE, id, 31536000);
    try {
      localStorage.setItem(NTR_ID_COOKIE, id);
    } catch {
      // Ignora erro
    }
    return id;
  }

  function inferFirstTouch() {
    const params = new URLSearchParams(win.location.search);
    const utmSource = (params.get("utm_source") || "").trim().slice(0, 256);
    const utmMedium = (params.get("utm_medium") || "").trim().slice(0, 256);
    const utmCampaign = (params.get("utm_campaign") || "").trim().slice(0, 256);
    const utmContent = (params.get("utm_content") || "").trim().slice(0, 256);
    const utmTerm = (params.get("utm_term") || "").trim().slice(0, 256);
    const fbclid = (params.get("fbclid") || "").trim();
    const gclid = (params.get("gclid") || "").trim();

    let refHost = "";
    if (document.referrer) {
      try {
        const h = new URL(document.referrer).hostname.toLowerCase();
        if (h !== "ntrmoto.com.br" && !h.endsWith(".ntrmoto.com.br") && h !== "localhost" && h !== "127.0.0.1") {
          refHost = h.replace(/^www\\./, "");
        }
      } catch {
        refHost = "";
      }
    }

    const base = { source: "direct", medium: "none", landing_path: win.location.pathname || "/", ts: Date.now() };
    if (refHost) base.referrer_host = refHost;
    if (utmSource) {
      base.source = utmSource;
      base.medium = utmMedium || "unknown";
      if (utmCampaign) base.campaign = utmCampaign;
      if (utmContent) base.content = utmContent;
      if (utmTerm) base.term = utmTerm;
      return base;
    }
    if (fbclid) { base.source = "facebook"; base.medium = "cpc"; return base; }
    if (gclid) { base.source = "google"; base.medium = "cpc"; return base; }
    if (refHost) {
      if (refHost === "gemini.google.com") { base.source = refHost; base.medium = "ai_referral"; return base; }
      if (refHost === "google.com" || refHost.startsWith("google.") || refHost.includes(".google.")) { base.source = "google"; base.medium = "organic"; return base; }
      if (refHost === "bing.com" || refHost.endsWith(".bing.com") || refHost === "duckduckgo.com" || refHost === "yahoo.com" || refHost.endsWith(".yahoo.com")) { base.source = refHost; base.medium = "organic"; return base; }
      if (refHost === "youtube.com" || refHost.endsWith(".youtube.com") || refHost === "youtu.be") { base.source = "youtube"; base.medium = "video"; return base; }
      if (refHost === "instagram.com" || refHost.endsWith(".instagram.com")) { base.source = "instagram"; base.medium = "social"; return base; }
      if (refHost === "facebook.com" || refHost.endsWith(".facebook.com") || refHost === "fb.com") { base.source = "facebook"; base.medium = "social"; return base; }
      if (refHost === "chatgpt.com" || refHost === "chat.openai.com" || refHost === "perplexity.ai" || refHost === "claude.ai") { base.source = refHost; base.medium = "ai_referral"; return base; }
      base.source = refHost;
      base.medium = "referral";
    }
    return base;
  }

  function getOrCreateFirstTouch() {
    let existing = null;
    const rawCookie = readCookie(NTR_FT_COOKIE);
    if (rawCookie) {
      try { existing = JSON.parse(rawCookie); } catch { existing = null; }
    }
    if (!existing) {
      try {
        const rawLs = localStorage.getItem(NTR_FT_COOKIE);
        if (rawLs) existing = JSON.parse(rawLs);
      } catch { existing = null; }
    }
    if (existing && existing.source) {
      if (!rawCookie) writeCookie(NTR_FT_COOKIE, JSON.stringify(existing), 15552000);
      return existing;
    }
    const inferred = inferFirstTouch();
    const serialized = JSON.stringify(inferred);
    writeCookie(NTR_FT_COOKIE, serialized, 15552000);
    try { localStorage.setItem(NTR_FT_COOKIE, serialized); } catch { /* ignore */ }
    return inferred;
  }

  function persistAttribution() {
    let stored = {};
    const rawCookie = readCookie(NTR_ATTR_COOKIE);
    if (rawCookie) {
      try { stored = JSON.parse(rawCookie) || {}; } catch { stored = {}; }
    } else {
      try {
        const rawLs = localStorage.getItem(NTR_ATTR_COOKIE);
        if (rawLs) stored = JSON.parse(rawLs) || {};
      } catch { stored = {}; }
    }
    const params = new URLSearchParams(win.location.search);
    const incoming = {};
    for (const key of ATTR_KEYS) {
      const val = (params.get(key) || "").trim();
      if (val) incoming[key] = val.slice(0, 256);
    }
    const merged = Object.assign({}, stored, incoming);
    if (Object.keys(merged).length > 0) {
      const serialized = JSON.stringify(merged);
      writeCookie(NTR_ATTR_COOKIE, serialized, 2592000);
      try { localStorage.setItem(NTR_ATTR_COOKIE, serialized); } catch { /* ignore */ }
    }
    return merged;
  }

  function recordJourneyTouch() {
    try {
      const raw = localStorage.getItem(NTR_JOURNEY_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const entry = { h: win.location.hostname.toLowerCase(), p: win.location.pathname };
      const last = list[list.length - 1];
      if (!last || last.h !== entry.h || last.p !== entry.p) {
        list.push(entry);
        if (list.length > 12) list.splice(0, list.length - 12);
        localStorage.setItem(NTR_JOURNEY_KEY, JSON.stringify(list));
      }
      return list.length;
    } catch {
      return 1;
    }
  }

  function isCrossDomainTarget(host) {
    const h = (host || "").toLowerCase();
    return h === "escolademotores.com.br" || h.endsWith(".escolademotores.com.br");
  }

  function isCheckoutDestination(host) {
    const h = (host || "").toLowerCase();
    return h === "eduzz.com" || h.endsWith(".eduzz.com") || h === "greenn.com.br" || h.endsWith(".greenn.com.br");
  }

  function isLeadDestination(host) {
    const h = (host || "").toLowerCase();
    return isCrossDomainTarget(h) || h === "wa.me" || h === "api.whatsapp.com";
  }

  function detectInAppBrowser(userAgent) {
    const ua = userAgent || "";
    if (/instagram/i.test(ua)) return "instagram";
    if (/fban|fbav|fb_iab|facebook/i.test(ua)) return "facebook";
    if (/musical_ly|tiktok|bytedance/i.test(ua)) return "tiktok";
    if (/whatsapp/i.test(ua)) return "whatsapp";
    if (/linkedinapp/i.test(ua)) return "linkedin";
    if (/;\\s*wv\\)/i.test(ua)) return "webview";
    return "browser";
  }

  function resolveOfferByUrl(rawHref) {
    try {
      const parsed = new URL(rawHref, win.location.href);
      const host = parsed.hostname.toLowerCase();
      if (host !== "eduzz.com" && !host.endsWith(".eduzz.com")) return null;
      const seg = parsed.pathname.split("/").filter(Boolean)[0];
      if (!seg) return null;
      return EDUZZ_OFFERS[seg] || EDUZZ_OFFERS[seg.toUpperCase()] || null;
    } catch {
      return null;
    }
  }

  function decorateCrossDomainUrl(rawHref, ntrId, attribution) {
    try {
      const dest = new URL(rawHref, win.location.href);
      if (dest.protocol !== "http:" && dest.protocol !== "https:") return null;
      if (!isCrossDomainTarget(dest.hostname)) return null;
      if (ntrId && !dest.searchParams.has(NTR_ID_COOKIE)) dest.searchParams.set(NTR_ID_COOKIE, ntrId);
      if (attribution.fbclid && !dest.searchParams.has("fbclid")) dest.searchParams.set("fbclid", attribution.fbclid);
      if (attribution.gclid && !dest.searchParams.has("gclid")) dest.searchParams.set("gclid", attribution.gclid);
      return dest.toString();
    } catch {
      return null;
    }
  }

  function decorateCheckoutUrl(rawHref, ntrId, attribution, firstTouch) {
    try {
      const dest = new URL(rawHref, win.location.href);
      if (dest.protocol !== "http:" && dest.protocol !== "https:") return null;
      if (!isCheckoutDestination(dest.hostname)) return null;
      const src = attribution.utm_source || (firstTouch && firstTouch.source !== "direct" ? firstTouch.source : "");
      const med = attribution.utm_medium || (firstTouch && firstTouch.medium !== "none" ? firstTouch.medium : "");
      const cmp = attribution.utm_campaign || (firstTouch && firstTouch.campaign) || "";
      const cnt = attribution.utm_content || (firstTouch && firstTouch.content) || "";
      const trm = attribution.utm_term || (firstTouch && firstTouch.term) || "";
      if (src && !dest.searchParams.has("utm_source")) dest.searchParams.set("utm_source", src);
      if (med && !dest.searchParams.has("utm_medium")) dest.searchParams.set("utm_medium", med);
      if (cmp && !dest.searchParams.has("utm_campaign")) dest.searchParams.set("utm_campaign", cmp);
      if (cnt && !dest.searchParams.has("utm_content")) dest.searchParams.set("utm_content", cnt);
      if (trm && !dest.searchParams.has("utm_term")) dest.searchParams.set("utm_term", trm);
      if (attribution.fbclid && !dest.searchParams.has("fbclid")) dest.searchParams.set("fbclid", attribution.fbclid);
      if (attribution.gclid && !dest.searchParams.has("gclid")) dest.searchParams.set("gclid", attribution.gclid);
      if (ntrId && !dest.searchParams.has(NTR_ID_COOKIE)) dest.searchParams.set(NTR_ID_COOKIE, ntrId);
      return dest.toString();
    } catch {
      return null;
    }
  }

  function normalizeLeadPii(emailVal, phoneVal, nameVal) {
    const out = {};
    const em = (emailVal || "").trim().toLowerCase();
    if (em && em.includes("@")) out.em = em;
    const digits = (phoneVal || "").replace(/\\D/g, "");
    if (digits.length >= 10) out.ph = (digits.length === 10 || digits.length === 11) ? "55" + digits : digits;
    const parts = (nameVal || "").trim().toLowerCase().split(/\\s+/).filter(Boolean);
    if (parts.length >= 1) out.fn = parts[0];
    if (parts.length >= 2) out.ln = parts[parts.length - 1];
    return out;
  }

  // Banner LGPD (#ntr-cb) + Consent Mode v2
  const root = document.getElementById("ntr-cb");
  const mainEl = document.getElementById("ntr-cb-main");
  const prefsEl = document.getElementById("ntr-cb-prefs");
  const chkAnalytics = document.getElementById("ntr-cb-chk-analytics");
  const chkMarketing = document.getElementById("ntr-cb-chk-marketing");
  const btnOk = document.getElementById("ntr-cb-ok");
  const btnCfg = document.getElementById("ntr-cb-cfg");
  const btnClose = document.getElementById("ntr-cb-close");
  const btnSave = document.getElementById("ntr-cb-save");
  const btnReject = document.getElementById("ntr-cb-reject");

  function setBarCookie() {
    writeCookie(BAR_COOKIE, "1", 31536000);
  }

  function updateGoogleConsent(analyticsGranted, marketingGranted) {
    try {
      win.zaraz?.set?.("google_consent_update", {
        analytics_storage: analyticsGranted ? "granted" : "denied",
        ad_storage: marketingGranted ? "granted" : "denied",
        ad_user_data: marketingGranted ? "granted" : "denied",
        ad_personalization: marketingGranted ? "granted" : "denied",
      });
    } catch {
      // Ignora erro caso zaraz ainda não esteja pronto
    }
  }

  function syncFromConsentCookie() {
    if (!hasCookie(CONSENT_COOKIE)) return;
    const cur = win.zaraz?.consent?.getAll?.();
    if (!cur) return;
    updateGoogleConsent(cur.analytics === true, cur.marketing === true);
  }

  function ensureDefaultOptOutConsent() {
    const z = win.zaraz;
    if (!z?.consent?.APIReady) return;
    if (!hasCookie(CONSENT_COOKIE)) {
      z.consent.set?.({ analytics: true, marketing: true });
      z.consent.sendQueuedEvents?.();
      updateGoogleConsent(true, true);
    } else {
      syncFromConsentCookie();
    }
  }

  function hideBar() {
    if (!root || !mainEl || !prefsEl) return;
    root.hidden = true;
    prefsEl.hidden = true;
    mainEl.hidden = false;
  }

  function openPrefs() {
    if (!root || !mainEl || !prefsEl) return;
    const cur = win.zaraz?.consent?.getAll?.() ?? {};
    if (chkAnalytics) chkAnalytics.checked = cur.analytics !== false;
    if (chkMarketing) chkMarketing.checked = cur.marketing !== false;
    mainEl.hidden = true;
    prefsEl.hidden = false;
    root.hidden = false;
  }

  win.__ntrOpenCookiePrefs = openPrefs;

  let isTopFrame = true;
  try {
    isTopFrame = win.self === win.top;
  } catch {
    isTopFrame = false;
  }

  if (root && mainEl && prefsEl && isTopFrame && !hasCookie(BAR_COOKIE)) {
    mainEl.hidden = false;
    prefsEl.hidden = true;
    root.hidden = false;
  }

  btnOk?.addEventListener("click", () => {
    win.zaraz?.consent?.setAll?.(true);
    win.zaraz?.consent?.sendQueuedEvents?.();
    updateGoogleConsent(true, true);
    setBarCookie();
    hideBar();
  });

  btnCfg?.addEventListener("click", openPrefs);

  btnClose?.addEventListener("click", () => {
    if (hasCookie(BAR_COOKIE)) {
      hideBar();
    } else if (mainEl && prefsEl) {
      prefsEl.hidden = true;
      mainEl.hidden = false;
    }
  });

  btnSave?.addEventListener("click", () => {
    const analytics = chkAnalytics ? chkAnalytics.checked : true;
    const marketing = chkMarketing ? chkMarketing.checked : true;
    win.zaraz?.consent?.set?.({ analytics, marketing });
    if (analytics || marketing) {
      win.zaraz?.consent?.sendQueuedEvents?.();
    }
    updateGoogleConsent(analytics, marketing);
    setBarCookie();
    hideBar();
  });

  btnReject?.addEventListener("click", () => {
    win.zaraz?.consent?.setAll?.(false);
    updateGoogleConsent(false, false);
    setBarCookie();
    hideBar();
  });

  if (win.zaraz?.consent?.APIReady) {
    ensureDefaultOptOutConsent();
  } else {
    document.addEventListener("zarazConsentAPIReady", ensureDefaultOptOutConsent, { once: true });
  }
  document.addEventListener("zarazConsentChoicesUpdated", syncFromConsentCookie);

  document.querySelectorAll("[data-cookie-preferences]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (typeof win.__ntrOpenCookiePrefs === "function") {
        win.__ntrOpenCookiePrefs();
      } else {
        win.zaraz?.showConsentModal?.();
      }
    });
  });

  // Fila segura de eventos Zaraz + contexto first_touch
  const activeNtrId = getOrCreateNtrId();
  const activeFirstTouch = getOrCreateFirstTouch();
  const activeAttribution = persistAttribution();
  const touchCount = recordJourneyTouch();
  const pageOffer = CONTENT_SLUG ? (SLUG_OFFERS[CONTENT_SLUG] || null) : null;
  const inAppBrowser = detectInAppBrowser(navigator.userAgent || "");
  let detectedDeviceModel = "";

  const pendingZarazEvents = [];
  let zarazFlushScheduled = false;

  function applyZarazContext() {
    const z = win.zaraz;
    if (!z?.set) return;
    z.set("first_touch_source", activeFirstTouch.source, { scope: "page" });
    z.set("first_touch_medium", activeFirstTouch.medium, { scope: "page" });
    z.set("first_touch_campaign", activeFirstTouch.campaign || "", { scope: "page" });
    z.set("touch_count", touchCount, { scope: "page" });
    z.set("in_app_browser", inAppBrowser, { scope: "page" });
    if (detectedDeviceModel) z.set("device_model", detectedDeviceModel, { scope: "page" });
  }

  function scheduleHighEntropyDeviceModel() {
    const uaData = navigator.userAgentData;
    if (!uaData || typeof uaData.getHighEntropyValues !== "function") return;
    const collect = () => {
      uaData.getHighEntropyValues(["model", "platformVersion"]).then((hints) => {
        const model = hints && typeof hints.model === "string" ? hints.model.trim() : "";
        if (model) {
          detectedDeviceModel = model;
          win.zaraz?.set?.("device_model", model, { scope: "page" });
        }
      }).catch(() => {});
    };
    if (typeof win.requestIdleCallback === "function") {
      win.requestIdleCallback(collect, { timeout: 1500 });
    } else {
      win.setTimeout(collect, 0);
    }
  }
  scheduleHighEntropyDeviceModel();

  function flushPendingZarazEvents() {
    const z = win.zaraz;
    if (!z?.track) return false;
    applyZarazContext();
    while (pendingZarazEvents.length > 0) {
      const item = pendingZarazEvents.shift();
      if (item) z.track(item.name, item.props);
    }
    return true;
  }

  function trackZaraz(eventName, props) {
    const z = win.zaraz;
    if (z?.track) {
      applyZarazContext();
      z.track(eventName, props);
      return;
    }
    pendingZarazEvents.push({ name: eventName, props });
    if (!zarazFlushScheduled) {
      zarazFlushScheduled = true;
      document.addEventListener("zarazLoaded", () => flushPendingZarazEvents(), { once: true });
      let attempts = 0;
      const timer = win.setInterval(() => {
        attempts += 1;
        if (flushPendingZarazEvents() || attempts >= 20) {
          win.clearInterval(timer);
        }
      }, 250);
    }
  }

  applyZarazContext();

  function decorateAnchor(anchor) {
    const d1 = decorateCrossDomainUrl(anchor.href, activeNtrId, activeAttribution);
    if (d1) { anchor.href = d1; return; }
    const d2 = decorateCheckoutUrl(anchor.href, activeNtrId, activeAttribution, activeFirstTouch);
    if (d2) { anchor.href = d2; }
  }

  document.querySelectorAll("a[href]").forEach(decorateAnchor);

  if (CONTENT_TYPE && CONTENT_SLUG) {
    const vcProps = {
      content_type: CONTENT_TYPE,
      content_slug: CONTENT_SLUG,
      page_path: win.location.pathname,
      event_id: generateEventId("vc"),
      first_touch_source: activeFirstTouch.source,
      first_touch_medium: activeFirstTouch.medium,
      first_touch_campaign: activeFirstTouch.campaign || "",
      touch_count: touchCount,
    };
    if (pageOffer) {
      vcProps.content_ids = pageOffer.id;
      vcProps.value = pageOffer.value;
      vcProps.currency = pageOffer.currency;
    }
    trackZaraz("view_content", vcProps);
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest("a");
    if (!anchor || !anchor.href) return;
    try {
      decorateAnchor(anchor);
      const dest = new URL(anchor.href, win.location.href);
      const host = dest.hostname.toLowerCase();
      if (isCheckoutDestination(host) || isLeadDestination(host)) {
        const ctaText = (anchor.textContent || "").replace(/\\s+/g, " ").trim().slice(0, 120);
        const resolvedOffer = resolveOfferByUrl(dest.href) || pageOffer;
        const ctaProps = {
          link_url: dest.href,
          link_host: host,
          page_path: win.location.pathname,
          cta_text: ctaText,
          event_id: generateEventId("cta"),
          first_touch_source: activeFirstTouch.source,
          first_touch_medium: activeFirstTouch.medium,
          first_touch_campaign: activeFirstTouch.campaign || "",
          touch_count: touchCount,
        };
        if (resolvedOffer) {
          ctaProps.content_ids = resolvedOffer.id;
          ctaProps.value = resolvedOffer.value;
          ctaProps.currency = resolvedOffer.currency;
        }
        trackZaraz("cta_click", ctaProps);
      }
    } catch {
      // Ignora URLs inválidas
    }
  });

  // Captura não-destrutiva de formulários legados SwipePages para EMQ elevado (em/ph/fn/ln)
  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const emailEl = form.querySelector('input[type="email"]');
    const phoneEl = form.querySelector('input[type="tel"]');
    const nameEl = form.querySelector('input[type="text"]');
    const pii = normalizeLeadPii(emailEl?.value, phoneEl?.value, nameEl?.value);
    if (!pii.em && !pii.ph) return;
    const leadProps = Object.assign({
      content_name: (pageOffer && pageOffer.name) || CONTENT_SLUG || document.title,
      page_path: win.location.pathname,
      event_id: generateEventId("lead"),
      first_touch_source: activeFirstTouch.source,
      first_touch_campaign: activeFirstTouch.campaign || "",
    }, pii);
    if (pageOffer) {
      leadProps.content_ids = pageOffer.id;
      leadProps.value = pageOffer.value;
      leadProps.currency = pageOffer.currency;
    }
    trackZaraz("generate_lead", leadProps);
  }, true);

  let firedScroll50 = false;
  let firedScroll90 = false;
  let scrollTicking = false;

  function evaluateScrollDepth() {
    scrollTicking = false;
    const scrollable = document.documentElement.scrollHeight - win.innerHeight;
    if (scrollable <= 0) return;
    const currentY = win.scrollY || win.pageYOffset || 0;
    const pct = (currentY / scrollable) * 100;
    if (!firedScroll50 && pct >= 50) {
      firedScroll50 = true;
      trackZaraz("scroll_depth", { percent_scrolled: 50, page_path: win.location.pathname, event_id: generateEventId("scr50") });
    }
    if (!firedScroll90 && pct >= 90) {
      firedScroll90 = true;
      trackZaraz("scroll_depth", { percent_scrolled: 90, page_path: win.location.pathname, event_id: generateEventId("scr90") });
    }
    if (firedScroll50 && firedScroll90) {
      win.removeEventListener("scroll", onScrollPassive);
    }
  }

  function onScrollPassive() {
    if (scrollTicking) return;
    scrollTicking = true;
    win.requestAnimationFrame(evaluateScrollDepth);
  }

  win.addEventListener("scroll", onScrollPassive, { passive: true });
})();
</script>`.trim();
}
