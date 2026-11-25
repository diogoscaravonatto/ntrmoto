import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const SLUGS = [
  "pro",
  "combo-comandos-4em1pro",
  "curso-cabecote-v02",
  "crp-pv11",
  "calculadora-pv1",
  "calculadora-pv2",
  "calculadora-up",
  "gmp-lp11",
  "gmp",
  "ctx-pv5",
  "ctx-pv6",
  "aula-cambio",
  "embededcalc1",
  "embededcalc2",
];

const NOINDEX_SLUGS = new Set(["calculadora-up", "embededcalc1", "embededcalc2"]);
const SOURCE_ORIGIN = "https://www.escolademotores.com.br";
const TARGET_ORIGIN = "https://www.ntrmoto.com.br";

const ROOT_DIR = process.cwd();
const PUBLIC_LEGACY_DIR = path.join(ROOT_DIR, "public", "legacy-sp");
const LEGACY_HTML_DIR = path.join(ROOT_DIR, "src", "legacy-swipepages");
const PAGES_DIR = path.join(ROOT_DIR, "src", "pages");
const DOCS_DIR = path.join(ROOT_DIR, "docs");

const ASSET_HOST_START =
  /https?:\/\/(?:escolademotorescombr\.swipepages\.media|media\.swipepages\.com|assets\.swipepages\.com|scripts\.swipepages\.com)\//g;

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MiB
const MAX_TOTAL_BYTES = 150 * 1024 * 1024; // 150 MB
const CONCURRENCY = 12;

function extractAssetUrls(html) {
  const urls = [];
  ASSET_HOST_START.lastIndex = 0;
  let match;
  while ((match = ASSET_HOST_START.exec(html)) !== null) {
    const start = match.index;
    let i = start + match[0].length;
    let parenDepth = 0;
    while (i < html.length) {
      const ch = html[i];
      if (
        ch === '"' ||
        ch === "'" ||
        ch === "<" ||
        ch === ">" ||
        ch === "\\" ||
        ch === ";" ||
        ch === "," ||
        ch === "}" ||
        /\s/.test(ch)
      ) {
        break;
      }
      if (ch === "(") {
        parenDepth++;
      } else if (ch === ")") {
        if (parenDepth === 0) {
          break;
        }
        parenDepth--;
      }
      i++;
    }
    const raw = html.slice(start, i);
    const normalized = raw.replace(/&amp;/g, "&");
    if (normalized.length > match[0].length) {
      urls.push(normalized);
    }
  }
  return urls;
}

function isIgnoredFontOrAnalytics(urlStr) {
  let pathname = "";
  try {
    pathname = new URL(urlStr).pathname.toLowerCase();
  } catch {
    return false;
  }
  if (urlStr.includes("scripts.swipepages.com/js/analytics.min.js")) {
    return true;
  }
  if (urlStr.includes("assets.swipepages.com/fonts/")) {
    if (pathname.endsWith(".eot") || pathname.endsWith(".svg")) {
      return true;
    }
  }
  return false;
}

function getCategory(urlStr) {
  const host = new URL(urlStr).hostname.toLowerCase();
  if (host === "scripts.swipepages.com") return "js";
  if (host === "assets.swipepages.com" && urlStr.includes("/fonts/")) return "fonts";
  return "media";
}

function extFromContentType(ct) {
  const clean = (ct || "").split(";")[0].trim().toLowerCase();
  const map = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/svg+xml": ".svg",
    "image/gif": ".gif",
    "image/x-icon": ".ico",
    "application/javascript": ".js",
    "text/javascript": ".js",
    "text/css": ".css",
    "font/woff2": ".woff2",
    "font/woff": ".woff",
    "font/ttf": ".ttf",
    "font/otf": ".otf",
    "application/font-woff": ".woff",
    "application/font-woff2": ".woff2",
    "application/octet-stream": "",
  };
  return map[clean] || "";
}

function buildSafeFilename(urlStr, contentType) {
  const u = new URL(urlStr);
  let decodedPath = u.pathname;
  try {
    decodedPath = decodeURIComponent(u.pathname);
  } catch {
    // mantém pathname bruto se falhar decode
  }
  const base = path.posix.basename(decodedPath) || "asset";
  const rawExt = path.posix.extname(base).toLowerCase();
  const allowedExts = new Set([
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".avif",
    ".svg",
    ".gif",
    ".ico",
    ".js",
    ".css",
    ".woff2",
    ".woff",
    ".ttf",
    ".otf",
    ".mp4",
    ".webm",
    ".json",
  ]);
  let ext = allowedExts.has(rawExt) ? rawExt : extFromContentType(contentType);
  if (!ext) ext = ".bin";

  const nameWithoutExt = rawExt && allowedExts.has(rawExt) ? base.slice(0, -rawExt.length) : base;
  const safeBase =
    nameWithoutExt
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 60) || "asset";

  const hash = crypto.createHash("sha256").update(urlStr).digest("hex").slice(0, 12);
  return `${hash}-${safeBase}${ext}`;
}

async function fetchWithRetry(url, retries = 1) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; NTR-Migration/1.0)",
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const contentType = res.headers.get("content-type") || "";
      return { buf, contentType, status: res.status };
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }
  throw lastErr;
}

async function runPool(items, concurrency, worker) {
  let idx = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (idx < items.length) {
      const current = items[idx++];
      await worker(current);
    }
  });
  await Promise.all(runners);
}

function sanitizeHtml(html, slug, assetMap) {
  let out = html;

  // 1. Remover /sp-events.js e analytics.min.js do SwipePages
  out = out.replace(
    /<script\b[^>]*\bsrc=["'][^"']*\/sp-events\.js[^"']*["'][^>]*>\s*<\/script>/gi,
    "",
  );
  out = out.replace(
    /<script\b[^>]*\bsrc=["']https?:\/\/scripts\.swipepages\.com\/js\/analytics\.min\.js[^"']*["'][^>]*>\s*<\/script>/gi,
    "",
  );

  // 2. Remover URLs de fontes .eot e .svg dentro de @font-face de assets.swipepages.com/fonts/
  out = out.replace(
    /src\s*:\s*url\((['"]?)https?:\/\/assets\.swipepages\.com\/fonts\/[^)'"]+\.eot[^)'"]*\1\)\s*;\s*/gi,
    "",
  );
  out = out.replace(
    /url\((['"]?)https?:\/\/assets\.swipepages\.com\/fonts\/[^)'"]+\.(?:eot|svg)[^)'"]*\1\)\s*format\((['"]?)(?:embedded-opentype|svg)\2\)\s*,?\s*/gi,
    "",
  );
  out = out.replace(/,\s*;/g, ";");

  // 3. Substituir URLs de assets (maior comprimento primeiro; cobre normal e &amp;)
  const replacements = [];
  for (const [remoteUrl, localPath] of assetMap.entries()) {
    replacements.push([remoteUrl, localPath]);
    const ampUrl = remoteUrl.replace(/&/g, "&amp;");
    if (ampUrl !== remoteUrl) {
      replacements.push([ampUrl, localPath]);
    }
  }
  replacements.sort((a, b) => b[0].length - a[0].length);
  for (const [remoteUrl, localPath] of replacements) {
    if (out.includes(remoteUrl)) {
      out = out.split(remoteUrl).join(localPath);
    }
  }

  // 4. Garantir URL absoluta em og:image / twitter:image / meta[name=image]
  out = out.replace(
    /(<meta\b[^>]*\b(?:property|name)=["'](?:og:image|twitter:image|image)["'][^>]*\bcontent=["'])(\/legacy-sp\/[^"']+)(["'])/gi,
    `$1${TARGET_ORIGIN}$2$3`,
  );
  // Se algum og:image externo do SwipePages retornou 403 e não pôde ser baixado, usa o fallback local
  out = out.replace(
    /(<meta\b[^>]*\b(?:property|name)=["'](?:og:image|twitter:image|image)["'][^>]*\bcontent=["'])https?:\/\/(?:media\.swipepages\.com|escolademotorescombr\.swipepages\.media)\/[^"']+(["'])/gi,
    `$1${TARGET_ORIGIN}/images/mockup_combo.webp$2`,
  );

  // 5. Idioma pt-BR
  out = out.replace(/<html\b([^>]*?)\blang=["'][^"']*["']/i, '<html$1lang="pt-BR"');

  // 6. Atualizar og:url para www.ntrmoto.com.br/<slug>/
  const canonicalUrl = `${TARGET_ORIGIN}/${slug}/`;
  out = out.replace(
    /(<meta\b[^>]*\bproperty=["']og:url["'][^>]*\bcontent=["'])https?:\/\/[^"']+(["'])/gi,
    `$1${canonicalUrl}$2`,
  );

  // 7. Inserir <link rel="canonical"> (e noindex para páginas privadas/upsell sem duplicar) logo após </title>
  out = out.replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi, "");
  if (NOINDEX_SLUGS.has(slug)) {
    out = out.replace(/<meta\b[^>]*\bname=["']robots["'][^>]*>/gi, "");
  }
  const headAdditions = [`<link rel="canonical" href="${canonicalUrl}" />`];
  if (NOINDEX_SLUGS.has(slug)) {
    headAdditions.push('<meta name="robots" content="noindex, nofollow" />');
  }
  out = out.replace(/<\/title>/i, `</title>${headAdditions.join("")}`);

  return out;
}

function collectPageAudit(slug, html, replacedAssetsCount, failedAssets) {
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  const eduzzLinks = [
    ...new Set(html.match(/https?:\/\/(?:sun|chk)\.eduzz\.com\/[^"'<>\\\s)]+/gi) || []),
  ].sort();
  const pandaIframes = [
    ...new Set(
      html.match(/https?:\/\/player[^"'<>\\\s]*pandavideo\.com\.br\/[^"'<>\\\s]+/gi) || [],
    ),
  ].sort();
  const calconicEmbeds = [
    ...new Set(
      [
        ...html.matchAll(/https?:\/\/app\.calconic\.com\/api\/embed\/calculator\/([a-f0-9]+)/gi),
      ].map((m) => m[1]),
    ),
  ];
  const hasCademiRemote = html.includes("core.cademi.com.br/assets/js/remote.js");
  const gtmIds = [...new Set(html.match(/GTM-[A-Z0-9]+/g) || [])].sort();
  const hasStape = html.includes("stape.escolademotores.com.br");
  const hasUtmify = html.includes("cdn.utmify.com.br");
  const hasSwipeForms = /action-xhr=["']https?:\/\/app\.swipepages\.com\/api\/leads["']/i.test(
    html,
  );

  const residualSwipeUrls = [
    ...new Set(
      (
        html.match(
          /https?:\/\/(?:escolademotorescombr\.swipepages\.media|media\.swipepages\.com|assets\.swipepages\.com|scripts\.swipepages\.com)\/[^"'<>\\\s]+/gi,
        ) || []
      ).concat(html.match(/\/sp-events\.js/gi) || []),
    ),
  ];

  return {
    slug,
    targetUrl: `${TARGET_ORIGIN}/${slug}/`,
    sourceUrl: `${SOURCE_ORIGIN}/${slug}`,
    title,
    noindex: NOINDEX_SLUGS.has(slug),
    htmlBytes: Buffer.byteLength(html, "utf8"),
    localizedAssetsCount: replacedAssetsCount,
    failedAssets,
    eduzzLinks,
    pandaVideoEmbeds: pandaIframes,
    calconicEmbeds,
    hasCademiRemote,
    gtmIds,
    hasStape,
    hasUtmify,
    hasLegacySwipeForms: hasSwipeForms,
    residualSwipeUrls,
  };
}

async function main() {
  await fs.rm(PUBLIC_LEGACY_DIR, { recursive: true, force: true });
  await fs.mkdir(path.join(PUBLIC_LEGACY_DIR, "media"), { recursive: true });
  await fs.mkdir(path.join(PUBLIC_LEGACY_DIR, "fonts"), { recursive: true });
  await fs.mkdir(path.join(PUBLIC_LEGACY_DIR, "js"), { recursive: true });
  await fs.mkdir(LEGACY_HTML_DIR, { recursive: true });
  await fs.mkdir(DOCS_DIR, { recursive: true });

  console.log(`Baixando ${SLUGS.length} páginas de ${SOURCE_ORIGIN}...`);
  const pagesRaw = new Map();
  const pageAssetsMap = new Map();
  const allAssetUrls = new Set();

  for (const slug of SLUGS) {
    const url = `${SOURCE_ORIGIN}/${slug}`;
    const { buf } = await fetchWithRetry(url, 1);
    const html = buf.toString("utf8");
    pagesRaw.set(slug, html);

    const matches = extractAssetUrls(html);
    const cleanedForPage = new Set();
    for (const normalized of matches) {
      if (!isIgnoredFontOrAnalytics(normalized)) {
        cleanedForPage.add(normalized);
        allAssetUrls.add(normalized);
      }
    }
    pageAssetsMap.set(slug, cleanedForPage);
    console.log(
      `  ✓ /${slug} (${(buf.length / 1024).toFixed(1)} KB, ${cleanedForPage.size} assets únicos)`,
    );
  }

  console.log(`\nBaixando ${allAssetUrls.size} assets únicos (concorrência ${CONCURRENCY})...`);
  const assetMap = new Map();
  const failedMap = new Map();
  let totalBytes = 0;
  let largestFile = { file: "", bytes: 0 };

  await runPool([...allAssetUrls], CONCURRENCY, async (assetUrl) => {
    try {
      const { buf, contentType } = await fetchWithRetry(assetUrl, 1);
      if (buf.length > MAX_FILE_BYTES) {
        throw new Error(`Arquivo excede 20 MiB (${(buf.length / (1024 * 1024)).toFixed(2)} MiB)`);
      }
      const category = getCategory(assetUrl);
      const filename = buildSafeFilename(assetUrl, contentType);
      const diskPath = path.join(PUBLIC_LEGACY_DIR, category, filename);
      await fs.writeFile(diskPath, buf);

      const publicPath = `/legacy-sp/${category}/${filename}`;
      assetMap.set(assetUrl, publicPath);
      totalBytes += buf.length;
      if (buf.length > largestFile.bytes) {
        largestFile = { file: publicPath, bytes: buf.length };
      }
    } catch (err) {
      failedMap.set(assetUrl, String(err.message || err));
      console.error(`  ✗ Falha asset ${assetUrl}: ${err.message || err}`);
    }
  });

  if (totalBytes > MAX_TOTAL_BYTES) {
    throw new Error(
      `Total de assets excedeu 150 MB (${(totalBytes / (1024 * 1024)).toFixed(2)} MB). Abortando.`,
    );
  }

  console.log(
    `\nAssets baixados: ${assetMap.size}/${allAssetUrls.size} | Total: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB | Maior: ${largestFile.file} (${(largestFile.bytes / 1024).toFixed(1)} KB) | Falhas: ${failedMap.size}`,
  );

  const manifestPages = [];
  for (const slug of SLUGS) {
    const rawHtml = pagesRaw.get(slug);
    const cleanedHtml = sanitizeHtml(rawHtml, slug, assetMap);

    const legacyHtmlPath = path.join(LEGACY_HTML_DIR, `${slug}.html`);
    await fs.writeFile(legacyHtmlPath, cleanedHtml, "utf8");

    const pageDir = path.join(PAGES_DIR, slug);
    await fs.mkdir(pageDir, { recursive: true });
    const wrapperContent = `---\nimport rawHtml from '../../legacy-swipepages/${slug}.html?raw';\n---\n\n<Fragment set:html={rawHtml} />\n`;
    await fs.writeFile(path.join(pageDir, "index.astro"), wrapperContent, "utf8");

    const pageAssets = pageAssetsMap.get(slug);
    const pageFailed = [...pageAssets]
      .filter((u) => failedMap.has(u))
      .map((u) => ({ url: u, error: failedMap.get(u) }));
    const replacedCount = [...pageAssets].filter((u) => assetMap.has(u)).length;

    const audit = collectPageAudit(slug, cleanedHtml, replacedCount, pageFailed);
    manifestPages.push(audit);

    if (audit.residualSwipeUrls.length > 0) {
      console.warn(`  ⚠ /${slug} ainda possui URLs SwipePages:`, audit.residualSwipeUrls);
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    sourceOrigin: SOURCE_ORIGIN,
    targetOrigin: TARGET_ORIGIN,
    summary: {
      pagesImported: SLUGS.length,
      uniqueAssetsDiscovered: allAssetUrls.size,
      assetsDownloaded: assetMap.size,
      assetsFailed: failedMap.size,
      totalAssetsBytes: totalBytes,
      totalAssetsMB: Number((totalBytes / (1024 * 1024)).toFixed(2)),
      largestAsset: largestFile,
    },
    pages: manifestPages,
  };

  await fs.writeFile(
    path.join(DOCS_DIR, "swipepages-manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8",
  );
  console.log("\n✓ Manifesto salvo em docs/swipepages-manifest.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
