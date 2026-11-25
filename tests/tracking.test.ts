import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildCookieDomainSuffix,
  decorateCrossDomainUrl,
  extractAttributionParams,
  isCheckoutDestination,
  isCrossDomainTarget,
  isLeadDestination,
  isTrackedCtaDestination,
  mergeAttributionData,
} from "../src/utils/tracking";
import { enhanceLegacyHtml, injectLegacyZarazOnly, stripLegacyGtm } from "../src/utils/legacy-seo";

describe("tracking helpers (Zaraz + LGPD CMP)", () => {
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

  it("decora links para escolademotores.com.br preservando UTMs existentes", () => {
    expect(isCrossDomainTarget("lp.escolademotores.com.br")).toBe(true);
    expect(isCrossDomainTarget("www.ntrmoto.com.br")).toBe(false);

    const decorated = decorateCrossDomainUrl(
      "https://lp.escolademotores.com.br/clube/?utm_source=www_ntr&utm_medium=cta",
      "https://www.ntrmoto.com.br/cursos/",
      "ntr-uuid-999",
      {
        utm_source: "youtube",
        fbclid: "fb-111",
        gclid: "g-222",
      },
    );

    expect(decorated).not.toBeNull();
    const parsed = new URL(decorated!);
    expect(parsed.searchParams.get("utm_source")).toBe("www_ntr");
    expect(parsed.searchParams.get("utm_medium")).toBe("cta");
    expect(parsed.searchParams.get("_ntr_id")).toBe("ntr-uuid-999");
    expect(parsed.searchParams.get("fbclid")).toBe("fb-111");
    expect(parsed.searchParams.get("gclid")).toBe("g-222");

    expect(
      decorateCrossDomainUrl(
        "https://www.ntrmoto.com.br/cursos/clube-de-preparadores/",
        "https://www.ntrmoto.com.br/",
        "ntr-uuid-999",
        { fbclid: "fb-111" },
      ),
    ).toBeNull();

    expect(
      decorateCrossDomainUrl("https://sun.eduzz.com/2191231", "https://www.ntrmoto.com.br/", "id", {
        fbclid: "fb-111",
      }),
    ).toBeNull();
  });

  it("remove GTM/Stape legado e injeta Zaraz + LGPD CMP preservando scripts SwipePages e Utmify", () => {
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
