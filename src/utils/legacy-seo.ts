import {
  normalizeCanonicalUrl,
  resolveAbsoluteAssetUrl,
  serializeJsonLd,
  type SchemaNode,
} from "./seo";
import {
  buildLegacyZarazFooterAndBannerHtml,
  buildNtrIdHeadBootstrapScript,
  buildZarazConsentDefaultScript,
} from "./zaraz-runtime";

export interface LegacyHeadingFix {
  promoteFirstHeading?: {
    fromTag: "h2" | "h3";
    contains: string;
  };
  demoteHeading?: {
    fromTag: "h1";
    toTag: "h2";
    contains: string;
  };
}

export interface LegacyTrackingOptions {
  enabled?: boolean;
  stripLegacyGtm?: boolean;
  contentType?: string;
  contentSlug?: string;
}

export interface LegacySeoOptions {
  canonicalPath: string;
  title: string;
  description: string;
  ogImage: string;
  schema?: SchemaNode | SchemaNode[];
  headingFix?: LegacyHeadingFix;
  tracking?: LegacyTrackingOptions;
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtmlText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function stripPlainText(fragment: string): string {
  return fragment
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#xA0;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Remove exclusivamente containers GTM/Stape legados (scripts e noscripts),
 * preservando `tatsuFrontendConfig`, `cdn.utmify.com.br` e scripts de UI do SwipePages.
 */
export function stripLegacyGtm(html: string): string {
  return html
    .replace(
      /(?:<!--\s*Google Tag Manager\s*-->\s*)?<script\b[^>]*>[\s\S]*?(?:stape\.escolademotores\.com\.br\/4txurzhmh\.js|googletagmanager\.com\/gtm\.js)[\s\S]*?<\/script>(?:\s*<!--\s*End Google Tag Manager\s*-->)?/gi,
      "",
    )
    .replace(
      /<noscript\b[^>]*>[\s\S]*?(?:googletagmanager\.com\/ns\.html|stape\.escolademotores\.com\.br\/ns\.html)[\s\S]*?<\/noscript>/gi,
      "",
    );
}

function applyHeadingFix(bodyHtml: string, fix?: LegacyHeadingFix): string {
  if (!fix) return bodyHtml;
  let updated = bodyHtml;

  if (fix.demoteHeading) {
    const { fromTag, toTag, contains } = fix.demoteHeading;
    const re = new RegExp(`<${fromTag}([^>]*)>([\\s\\S]*?)<\\/${fromTag}>`, "gi");
    let done = false;
    updated = updated.replace(re, (full, attrs: string, inner: string) => {
      if (done) return full;
      if (stripPlainText(inner).toLowerCase().includes(contains.toLowerCase())) {
        done = true;
        return `<${toTag}${attrs}>${inner}</${toTag}>`;
      }
      return full;
    });
  }

  if (fix.promoteFirstHeading) {
    const { fromTag, contains } = fix.promoteFirstHeading;
    const re = new RegExp(`<${fromTag}([^>]*)>([\\s\\S]*?)<\\/${fromTag}>`, "gi");
    let done = false;
    updated = updated.replace(re, (full, attrs: string, inner: string) => {
      if (done) return full;
      if (stripPlainText(inner).toLowerCase().includes(contains.toLowerCase())) {
        done = true;
        return `<h1${attrs}>${inner}</h1>`;
      }
      return full;
    });
  }

  return updated;
}

function injectZarazTrackingIntoParts(
  head: string,
  body: string,
  tracking?: LegacyTrackingOptions,
): { head: string; body: string } {
  if (tracking?.enabled === false) {
    return { head, body };
  }

  const headScript = `<script>${buildNtrIdHeadBootstrapScript()}</script>`;
  const bodyConsentScript = `<script>${buildZarazConsentDefaultScript()}</script>`;
  const footerAndBannerHtml = buildLegacyZarazFooterAndBannerHtml({
    contentType: tracking?.contentType,
    contentSlug: tracking?.contentSlug,
  });

  const nextHead = `${head}\n${headScript}\n`;

  let nextBody = body;
  if (/<body\b[^>]*>/i.test(nextBody)) {
    nextBody = nextBody.replace(/<body\b[^>]*>/i, (openTag) => `${openTag}\n${bodyConsentScript}`);
  } else {
    nextBody = `${bodyConsentScript}\n${nextBody}`;
  }

  if (/<\/body>/i.test(nextBody)) {
    nextBody = nextBody.replace(/<\/body>/i, `\n${footerAndBannerHtml}\n</body>`);
  } else {
    nextBody = `${nextBody}\n${footerAndBannerHtml}`;
  }

  return { head: nextHead, body: nextBody };
}

/**
 * Injeta o pacote Zaraz + LGPD CMP (`_ntr_id`, Consent Mode v2, `#ntr-cb`, `Preferências de cookies`
 * e eventos canônicos) em HTMLs legados sem alterar metadados SEO (ex.: `/calculadora-up/`).
 */
export function injectLegacyZarazOnly(rawHtml: string, opts: LegacyTrackingOptions = {}): string {
  const cleaned = opts.stripLegacyGtm === false ? rawHtml : stripLegacyGtm(rawHtml);
  const headCloseIdx = cleaned.search(/<\/head>/i);
  if (headCloseIdx === -1) {
    return cleaned;
  }

  const head = cleaned.slice(0, headCloseIdx);
  const body = cleaned.slice(headCloseIdx);
  const tracked = injectZarazTrackingIntoParts(head, body, { ...opts, enabled: true });
  return `${tracked.head}${tracked.body}`;
}

/**
 * Atualiza metadados SEO (`<title>`, `description`, `canonical`, Open Graph),
 * injeta Schema JSON-LD dentro de `<head>` (sem tocar em `<title>` dentro de `<svg>`),
 * corrige hierarquia de `<h1>`, remove GTM/Stape duplicado e injeta Zaraz + LGPD CMP
 * em HTMLs legados importados do SwipePages.
 */
export function enhanceLegacyHtml(rawHtml: string, opts: LegacySeoOptions): string {
  const trackingEnabled = opts.tracking?.enabled !== false;
  const shouldStripGtm = trackingEnabled && opts.tracking?.stripLegacyGtm !== false;
  const sourceHtml = shouldStripGtm ? stripLegacyGtm(rawHtml) : rawHtml;

  const canonicalUrl = normalizeCanonicalUrl(opts.canonicalPath);
  const ogImageUrl = resolveAbsoluteAssetUrl(opts.ogImage);
  const safeTitle = escapeHtmlText(opts.title);
  const safeTitleAttr = escapeHtmlAttr(opts.title);
  const safeDescAttr = escapeHtmlAttr(opts.description);
  const safeCanonicalAttr = escapeHtmlAttr(canonicalUrl);
  const safeOgImageAttr = escapeHtmlAttr(ogImageUrl);

  const headCloseIdx = sourceHtml.search(/<\/head>/i);
  if (headCloseIdx === -1) {
    return applyHeadingFix(sourceHtml, opts.headingFix);
  }

  let head = sourceHtml.slice(0, headCloseIdx);
  let body = sourceHtml.slice(headCloseIdx);

  // Atualiza apenas o <title> do documento (dentro de <head>), nunca <title> de SVGs no body.
  if (/<title>[\s\S]*?<\/title>/i.test(head)) {
    head = head.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);
  } else {
    head += `\n<title>${safeTitle}</title>`;
  }

  // Remove metadados que serão reemitidos de forma canônica e limpa.
  head = head
    .replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>\s*/gi, "")
    .replace(/<meta\b[^>]*\bname=["']description["'][^>]*>\s*/gi, "")
    .replace(/<meta\b[^>]*\bproperty=["']og:(?:title|description|url|image)["'][^>]*>\s*/gi, "")
    .replace(/<meta\b[^>]*\bname=["']image["'][^>]*>\s*/gi, "")
    .replace(/<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, "");

  const injectedHeadTags = [
    `<meta name="description" content="${safeDescAttr}" />`,
    `<link rel="canonical" href="${safeCanonicalAttr}" />`,
    `<meta property="og:url" content="${safeCanonicalAttr}" />`,
    `<meta property="og:title" content="${safeTitleAttr}" />`,
    `<meta property="og:description" content="${safeDescAttr}" />`,
    `<meta property="og:image" content="${safeOgImageAttr}" />`,
    ...(opts.schema
      ? [`<script type="application/ld+json">${serializeJsonLd(opts.schema)}</script>`]
      : []),
  ].join("\n");

  head = `${head}\n${injectedHeadTags}\n`;
  body = applyHeadingFix(body, opts.headingFix);

  const tracked = injectZarazTrackingIntoParts(head, body, opts.tracking);
  return `${tracked.head}${tracked.body}`;
}
