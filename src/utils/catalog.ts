export interface CatalogOffer {
  id: string;
  slug: string;
  name: string;
  value: number;
  currency: "BRL";
}

export const EDUZZ_OFFERS_BY_ID: Record<string, CatalogOffer> = {
  VWGNYO1R07: {
    id: "eduzz_VWGNYO1R07",
    slug: "clube-de-preparadores",
    name: "Clube de Preparadores NTR (Anual)",
    value: 299,
    currency: "BRL",
  },
  "39ZQNOXB9E": {
    id: "eduzz_39ZQNOXB9E",
    slug: "clube-de-preparadores",
    name: "Clube de Preparadores NTR (Vitalício)",
    value: 899,
    currency: "BRL",
  },
  E9OO1GQV9B: {
    id: "eduzz_E9OO1GQV9B",
    slug: "formacao-pro",
    name: "Formação PRO NTR (15 Cursos)",
    value: 599,
    currency: "BRL",
  },
  G92V22EO9E: {
    id: "eduzz_G92V22EO9E",
    slug: "comandos-de-valvulas",
    name: "Combo Comandos 4 em 1 PRO",
    value: 297,
    currency: "BRL",
  },
  "816463": {
    id: "eduzz_816463",
    slug: "preparacao-de-cabecotes",
    name: "Curso Expert em Cabeçotes",
    value: 197,
    currency: "BRL",
  },
  "797936": {
    id: "eduzz_797936",
    slug: "curso-rapido-preparacao",
    name: "Curso Rápido de Preparação (CRP)",
    value: 147,
    currency: "BRL",
  },
  "1865589": {
    id: "eduzz_1865589",
    slug: "rei-do-4trinho",
    name: "Projeto Rei do 4Trinho (R4T)",
    value: 97,
    currency: "BRL",
  },
  E0D6EJX691: {
    id: "eduzz_E0D6EJX691",
    slug: "calculadora-de-motores",
    name: "Calculadora de Motores NTR",
    value: 67,
    currency: "BRL",
  },
  "1121929": {
    id: "eduzz_1121929",
    slug: "calculadora-de-motores",
    name: "Calculadora de Motores NTR (Oferta)",
    value: 67,
    currency: "BRL",
  },
  "1686735": {
    id: "eduzz_1686735",
    slug: "guia-motores-preparados",
    name: "Guia de Motores Preparados (GMP)",
    value: 47,
    currency: "BRL",
  },
  "1901654": {
    id: "eduzz_1901654",
    slug: "guia-motores-preparados",
    name: "Guia de Motores Preparados (GMP Combo)",
    value: 47,
    currency: "BRL",
  },
  "2191231": {
    id: "eduzz_2191231",
    slug: "taxa-de-compressao",
    name: "Curso Taxa de Compressão (Normal)",
    value: 37,
    currency: "BRL",
  },
  "2377783": {
    id: "eduzz_2377783",
    slug: "taxa-de-compressao",
    name: "Curso Taxa de Compressão (Combo 3 Cursos)",
    value: 75,
    currency: "BRL",
  },
  "1143144": {
    id: "eduzz_1143144",
    slug: "convite",
    name: "Clube NTR (Upsell Mensal)",
    value: 39.9,
    currency: "BRL",
  },
};

export const OFFERS_BY_SLUG: Record<string, CatalogOffer> = {
  "clube-de-preparadores": EDUZZ_OFFERS_BY_ID.VWGNYO1R07,
  "formacao-pro": EDUZZ_OFFERS_BY_ID.E9OO1GQV9B,
  "comandos-de-valvulas": EDUZZ_OFFERS_BY_ID.G92V22EO9E,
  "preparacao-de-cabecotes": EDUZZ_OFFERS_BY_ID["816463"],
  "curso-rapido-preparacao": EDUZZ_OFFERS_BY_ID["797936"],
  "rei-do-4trinho": EDUZZ_OFFERS_BY_ID["1865589"],
  "calculadora-de-motores": EDUZZ_OFFERS_BY_ID.E0D6EJX691,
  "guia-motores-preparados": EDUZZ_OFFERS_BY_ID["1686735"],
  "taxa-de-compressao": EDUZZ_OFFERS_BY_ID["2191231"],
  "tasa-de-compresion": EDUZZ_OFFERS_BY_ID["2191231"],
  "cambio-e-velocidade-final": {
    id: "aula_cambio",
    slug: "cambio-e-velocidade-final",
    name: "Aula Liberada — Câmbio e Velocidade Final",
    value: 0,
    currency: "BRL",
  },
  convite: EDUZZ_OFFERS_BY_ID["1143144"],
  "calculadora-up": EDUZZ_OFFERS_BY_ID.E0D6EJX691,
};

export function resolveOfferBySlug(slug: string): CatalogOffer | null {
  const key = slug.trim().toLowerCase();
  return OFFERS_BY_SLUG[key] ?? null;
}

export function resolveOfferByUrl(rawUrl: string): CatalogOffer | null {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();
    if (host !== "eduzz.com" && !host.endsWith(".eduzz.com")) {
      return null;
    }
    const firstSegment = parsed.pathname.split("/").filter(Boolean)[0];
    if (!firstSegment) return null;
    return (
      EDUZZ_OFFERS_BY_ID[firstSegment] ?? EDUZZ_OFFERS_BY_ID[firstSegment.toUpperCase()] ?? null
    );
  } catch {
    return null;
  }
}
