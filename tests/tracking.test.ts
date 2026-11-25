import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { resolveOfferBySlug, resolveOfferByUrl } from "../src/utils/catalog";
import { enhanceLegacyHtml, injectLegacyZarazOnly, stripLegacyGtm } from "../src/utils/legacy-seo";
import {
  buildCookieDomainSuffix,
  decorateCheckoutUrl,
  decorateCrossDomainUrl,
  detectInAppBrowser,
  extractAttributionParams,
  generateEventId,
  inferTouchFromContext,
  isCheckoutDestination,
  isCrossDomainTarget,
  isLeadDestination,
  isTrackedCtaDestination,
  mergeAttributionData,
  normalizeLeadPii,
} from "../src/utils/tracking";

describe("tracking helpers (Zaraz + LGPD CMP + Multi-Touch)", () => {
  it("gera sufixo de cookie root .ntrmoto.com.br em produção e local em localhost", () => {
    expect(buildCookieDomainSuffix("www.ntrmoto.com.br", "https:")).toBe(
      "; Domain=.ntrmoto.com.br; Path=/; SameSite=Lax; Secure",
    );
    expect(buildCookieDomainSuffix("ntrmoto.com.br", "https:")).toBe(
      "; Domain=.ntrmoto.com.br; Path=/; SameSite=Lax; Secure",
    );
    expect(buildCookieDomainSuffix("localhost", "http:")).toBe("; Path=/; SameSite=Lax");
  });

  it("extrai e mescla parâmetros de atribuição sem apagar chaves anteriores", () => {
    const first = extractAttributionParams(
      "?utm_source=youtube&utm_medium=video&fbclid=fb123&ignored=1",
    );
    expect(first).toEqual({
      utm_source: "youtube",
      utm_medium: "video",
      fbclid: "fb123",
    });

    const second = extractAttributionParams("?gclid=g456");
    expect(mergeAttributionData(first, second)).toEqual({
      utm_source: "youtube",
      utm_medium: "video",
      fbclid: "fb123",
      gclid: "g456",
    });
  });

  it("infere first_touch por UTM, click IDs, referrers orgânicos/sociais/IA e ignora subdomínios internos", () => {
    expect(
      inferTouchFromContext(
        "?utm_source=youtube&utm_medium=video&utm_campaign=taxa",
        "",
        "/cursos/",
        100,
      ),
    ).toMatchObject({
      source: "youtube",
      medium: "video",
      campaign: "taxa",
      landing_path: "/cursos/",
      ts: 100,
    });

    expect(inferTouchFromContext("?fbclid=abc", "", "/", 100)).toMatchObject({
      source: "facebook",
      medium: "cpc",
    });

    expect(
      inferTouchFromContext("", "https://www.google.com.br/search?q=taxa", "/cursos/", 100),
    ).toMatchObject({
      source: "google",
      medium: "organic",
    });

    expect(
      inferTouchFromContext("", "https://www.youtube.com/watch?v=123", "/", 100),
    ).toMatchObject({
      source: "youtube",
      medium: "video",
    });

    expect(inferTouchFromContext("", "https://chatgpt.com/c/123", "/", 100)).toMatchObject({
      source: "chatgpt.com",
      medium: "ai_referral",
    });

    expect(
      inferTouchFromContext("", "https://blog.ntrmoto.com.br/posts/taxa", "/", 100),
    ).toMatchObject({
      source: "direct",
      medium: "none",
    });
  });

  it("resolve ofertas oficiais por slug e URL Eduzz", () => {
    expect(resolveOfferByUrl("https://sun.eduzz.com/VWGNYO1R07?cupom=SBF26")).toMatchObject({
      id: "eduzz_VWGNYO1R07",
      value: 299,
      currency: "BRL",
    });
    expect(resolveOfferByUrl("https://chk.eduzz.com/39ZQNOXB9E?cupom=SBF26")).toMatchObject({
      id: "eduzz_39ZQNOXB9E",
      value: 899,
    });
    expect(resolveOfferByUrl("https://sun.eduzz.com/2191231")).toMatchObject({ value: 37 });
    expect(resolveOfferByUrl("https://sun.eduzz.com/2377783")).toMatchObject({ value: 75 });
    expect(resolveOfferBySlug("formacao-pro")).toMatchObject({
      id: "eduzz_E9OO1GQV9B",
      value: 599,
    });
    expect(resolveOfferByUrl("https://www.ntrmoto.com.br/cursos/")).toBeNull();
  });

  it("identifica apenas checkouts e saídas comerciais no cta_click de www.ntrmoto.com.br", () => {
    expect(isCheckoutDestination("sun.eduzz.com")).toBe(true);
    expect(isCheckoutDestination("chk.eduzz.com")).toBe(true);
    expect(isCheckoutDestination("pay.greenn.com.br")).toBe(true);
    expect(isCheckoutDestination("www.ntrmoto.com.br")).toBe(false);

    expect(isLeadDestination("lp.escolademotores.com.br")).toBe(true);
    expect(isLeadDestination("wa.me")).toBe(true);
    expect(isLeadDestination("api.whatsapp.com")).toBe(true);
    expect(isLeadDestination("www.ntrmoto.com.br")).toBe(false);

    expect(isTrackedCtaDestination("sun.eduzz.com")).toBe(true);
    expect(isTrackedCtaDestination("wa.me")).toBe(true);
    expect(isTrackedCtaDestination("lp.escolademotores.com.br")).toBe(true);
    expect(isTrackedCtaDestination("www.ntrmoto.com.br")).toBe(false);
    expect(isTrackedCtaDestination("ntrmoto.com.br")).toBe(false);
    expect(isTrackedCtaDestination("blog.ntrmoto.com.br")).toBe(false);
    expect(isTrackedCtaDestination("www.youtube.com")).toBe(false);
  });

  it("decora links para escolademotores.com.br e checkouts Eduzz preservando cupons e UTMs explícitas", () => {
    expect(isCrossDomainTarget("lp.escolademotores.com.br")).toBe(true);
    expect(isCrossDomainTarget("www.ntrmoto.com.br")).toBe(false);

    const decoratedCross = decorateCrossDomainUrl(
      "https://lp.escolademotores.com.br/clube/?utm_source=www_ntr&utm_medium=cta",
      "https://www.ntrmoto.com.br/cursos/",
      "ntr-uuid-999",
      { utm_source: "youtube", fbclid: "fb-111", gclid: "g-222" },
    );
    expect(decoratedCross).not.toBeNull();
    const parsedCross = new URL(decoratedCross!);
    expect(parsedCross.searchParams.get("utm_source")).toBe("www_ntr");
    expect(parsedCross.searchParams.get("_ntr_id")).toBe("ntr-uuid-999");

    const decoratedEduzz = decorateCheckoutUrl(
      "https://sun.eduzz.com/VWGNYO1R07?cupom=SBF26",
      "https://www.ntrmoto.com.br/cursos/clube-de-preparadores/",
      "ntr-uuid-999",
      { utm_source: "youtube", utm_medium: "video", utm_campaign: "taxa_2026", fbclid: "fb-111" },
      { source: "google", medium: "organic", landing_path: "/", ts: 1 },
    );
    expect(decoratedEduzz).not.toBeNull();
    const parsedEduzz = new URL(decoratedEduzz!);
    expect(parsedEduzz.searchParams.get("cupom")).toBe("SBF26");
    expect(parsedEduzz.searchParams.get("utm_source")).toBe("youtube");
    expect(parsedEduzz.searchParams.get("utm_medium")).toBe("video");
    expect(parsedEduzz.searchParams.get("utm_campaign")).toBe("taxa_2026");
    expect(parsedEduzz.searchParams.get("fbclid")).toBe("fb-111");
    expect(parsedEduzz.searchParams.get("_ntr_id")).toBe("ntr-uuid-999");

    expect(
      decorateCheckoutUrl(
        "https://www.ntrmoto.com.br/cursos/",
        "https://www.ntrmoto.com.br/",
        "ntr-uuid-999",
        { utm_source: "youtube" },
      ),
    ).toBeNull();
  });

  it("normaliza PII de formulário e gera event_id determinístico com prefixo", () => {
    expect(
      normalizeLeadPii({
        name: "  João Carlos Silva  ",
        email: "  JOAO@Exemplo.com ",
        phone: "(45) 99900-3816",
      }),
    ).toEqual({
      em: "joao@exemplo.com",
      ph: "5545999003816",
      fn: "joão",
      ln: "silva",
    });

    expect(generateEventId("vc")).toMatch(/^vc_[a-z0-9-]+$/i);
  });

  it("detecta WebViews in-app e configura Accept-CH em public/_headers", () => {
    expect(detectInAppBrowser("Mozilla/5.0 Instagram 310.0.0 Android")).toBe("instagram");
    expect(detectInAppBrowser("Mozilla/5.0 [FBAN/FBIOS;FBAV/450.0]")).toBe("facebook");
    expect(detectInAppBrowser("Mozilla/5.0 musical_ly_32.0.0")).toBe("tiktok");
    expect(detectInAppBrowser("WhatsApp/2.24.1")).toBe("whatsapp");
    expect(detectInAppBrowser("Mozilla/5.0 (Linux; Android 14; K; wv)")).toBe("webview");
    expect(
      detectInAppBrowser(
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36",
      ),
    ).toBe("browser");

    const headersText = readFileSync("public/_headers", "utf8");
    expect(headersText).toContain("Accept-CH:");
    expect(headersText).toContain("Sec-CH-UA-Model");
  });

  it("remove GTM/Stape legado e injeta Zaraz + LGPD CMP + Multi-Touch + Lead Form preservando SwipePages e Utmify", () => {
    const proRaw = readFileSync("src/legacy-swipepages/pro.html", "utf8");
    const enhancedPro = enhanceLegacyHtml(proRaw, {
      canonicalPath: "/cursos/formacao-pro/",
      title: "Formação PRO NTR",
      description: "Descrição de teste",
      ogImage: "/images/mockup_combo.webp",
      tracking: {
        contentType: "course",
        contentSlug: "formacao-pro",
      },
    });

    expect(enhancedPro).not.toContain("stape.escolademotores.com.br/4txurzhmh.js");
    expect(enhancedPro).toContain("cdn.utmify.com.br/scripts/utms/latest.js");
    expect(enhancedPro).toContain("tatsuFrontendConfig");
    expect(enhancedPro).toContain("_ntr_id");
    expect(enhancedPro).toContain("_ntr_ft");
    expect(enhancedPro).toContain("first_touch_source");
    expect(enhancedPro).toContain("generate_lead");
    expect(enhancedPro).toContain("google_consent_default");
    expect(enhancedPro).toContain('id="ntr-cb"');
    expect(enhancedPro).toContain("__ntrOpenCookiePrefs");
    expect(enhancedPro).toContain('"formacao-pro"');

    const comandosRaw = readFileSync("src/legacy-swipepages/combo-comandos-4em1pro.html", "utf8");
    const cleanedComandos = stripLegacyGtm(comandosRaw);
    expect(cleanedComandos).not.toContain("googletagmanager.com/gtm.js");
    expect(cleanedComandos).not.toContain("GTM-W4DNLLD");
    expect(cleanedComandos).toContain("tatsuFrontendConfig");

    const calcUpRaw = readFileSync("src/legacy-swipepages/calculadora-up.html", "utf8");
    const enhancedUp = injectLegacyZarazOnly(calcUpRaw, {
      contentType: "upsell",
      contentSlug: "calculadora-up",
    });
    expect(enhancedUp).toContain('<meta name="robots" content="noindex, nofollow" />');
    expect(enhancedUp).not.toContain("stape.escolademotores.com.br/4txurzhmh.js");
    expect(enhancedUp).toContain("cdn.utmify.com.br/scripts/utms/latest.js");
    expect(enhancedUp).toContain('id="ntr-cb"');
    expect(enhancedUp).toContain("google_consent_default");
    expect(enhancedUp).toContain('"calculadora-up"');
  });
});
