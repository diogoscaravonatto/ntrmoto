export const SITE_ORIGIN = "https://www.ntrmoto.com.br";
export const BRAND_NAME = "NTR Escola de Motores";
export const LEGAL_NAME = "NTR Treinamentos Ltda";
export const CNPJ = "31.507.848/0001-35";
export const INSTRUCTOR_NAME = "Fábio Scaravonatto";
export const WHATSAPP_URL = "https://wa.me/5545999003816";
export const YOUTUBE_URL = "https://www.youtube.com/@NTRmoto";
export const BLOG_URL = "https://blog.ntrmoto.com.br";
export const ORG_ID = `${SITE_ORIGIN}/#organization`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
export const DEFAULT_OG_IMAGE = "/images/mockup_combo.webp";

export type SchemaNode = Record<string, unknown>;

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface CourseSchemaInput {
  name: string;
  description: string;
  path: string;
  price: string;
  priceCurrency?: string;
  priceValidUntil?: string;
  image?: string;
  inLanguage?: string;
}

export interface SoftwareSchemaInput {
  name: string;
  description: string;
  path: string;
  price: string;
  image?: string;
}

export interface ProductSchemaInput {
  name: string;
  description: string;
  path: string;
  price: string;
  image?: string;
}

export interface CollectionSchemaInput {
  name: string;
  description: string;
  path: string;
  items: Array<{
    name: string;
    path: string;
    description?: string;
  }>;
}

export interface FaqItem {
  q: string;
  a: string;
}

/**
 * Normaliza caminhos canônicos para `https://www.ntrmoto.com.br/...` com trailing slash
 * consistente (alinhado ao `auto-trailing-slash` do Cloudflare Workers Static Assets).
 */
export function normalizeCanonicalPath(pathname: string): string {
  const clean = pathname.split(/[?#]/)[0]?.trim() || "/";
  if (clean === "/") return "/";
  const withLeading = clean.startsWith("/") ? clean : `/${clean}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

export function normalizeCanonicalUrl(
  pathname: string,
  origin: string | URL = SITE_ORIGIN,
): string {
  const normalizedPath = normalizeCanonicalPath(pathname);
  return new URL(normalizedPath, origin).toString();
}

export function resolveAbsoluteAssetUrl(
  assetPath: string,
  origin: string | URL = SITE_ORIGIN,
): string {
  return new URL(assetPath, origin).toString();
}

export function serializeJsonLd(schema: SchemaNode | SchemaNode[]): string {
  const payload = Array.isArray(schema)
    ? {
        "@context": "https://schema.org",
        "@graph": schema.map((node) => {
          const { "@context": _ctx, ...rest } = node;
          return rest;
        }),
      }
    : {
        "@context": "https://schema.org",
        ...schema,
      };

  return JSON.stringify(payload).replace(/</g, "\\u003c");
}

export function buildOrganizationSchema(): SchemaNode {
  return {
    "@type": "EducationalOrganization",
    "@id": ORG_ID,
    name: BRAND_NAME,
    legalName: LEGAL_NAME,
    url: `${SITE_ORIGIN}/`,
    logo: resolveAbsoluteAssetUrl("/images/logo_ntr.webp"),
    taxID: CNPJ,
    founder: {
      "@type": "Person",
      name: INSTRUCTOR_NAME,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cascavel",
      addressRegion: "PR",
      addressCountry: "BR",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      telephone: "+55-45-99900-3816",
      url: WHATSAPP_URL,
      availableLanguage: ["Portuguese"],
    },
    sameAs: [YOUTUBE_URL, BLOG_URL],
  };
}

export function buildWebSiteSchema(): SchemaNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_ORIGIN}/`,
    name: BRAND_NAME,
    inLanguage: "pt-BR",
    publisher: { "@id": ORG_ID },
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): SchemaNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: normalizeCanonicalUrl(item.path),
    })),
  };
}

export function buildCourseSchema(input: CourseSchemaInput): SchemaNode {
  const url = normalizeCanonicalUrl(input.path);
  return {
    "@type": "Course",
    "@id": `${url}#course`,
    name: input.name,
    description: input.description,
    url,
    inLanguage: input.inLanguage ?? "pt-BR",
    image: resolveAbsoluteAssetUrl(input.image ?? DEFAULT_OG_IMAGE),
    provider: { "@id": ORG_ID },
    instructor: {
      "@type": "Person",
      name: INSTRUCTOR_NAME,
    },
    offers: {
      "@type": "Offer",
      url,
      price: input.price,
      priceCurrency: input.priceCurrency ?? "BRL",
      availability: "https://schema.org/InStock",
      ...(input.priceValidUntil ? { priceValidUntil: input.priceValidUntil } : {}),
    },
  };
}

export function buildSoftwareApplicationSchema(input: SoftwareSchemaInput): SchemaNode {
  const url = normalizeCanonicalUrl(input.path);
  return {
    "@type": "SoftwareApplication",
    "@id": `${url}#software`,
    name: input.name,
    description: input.description,
    url,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web, Android, iOS",
    inLanguage: "pt-BR",
    image: resolveAbsoluteAssetUrl(input.image ?? DEFAULT_OG_IMAGE),
    publisher: { "@id": ORG_ID },
    offers: {
      "@type": "Offer",
      url,
      price: input.price,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
    },
  };
}

export function buildProductSchema(input: ProductSchemaInput): SchemaNode {
  const url = normalizeCanonicalUrl(input.path);
  return {
    "@type": "Product",
    "@id": `${url}#product`,
    name: input.name,
    description: input.description,
    url,
    image: resolveAbsoluteAssetUrl(input.image ?? DEFAULT_OG_IMAGE),
    brand: {
      "@type": "Brand",
      name: BRAND_NAME,
    },
    offers: {
      "@type": "Offer",
      url,
      price: input.price,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
    },
  };
}

export function buildCollectionPageSchema(input: CollectionSchemaInput): SchemaNode {
  const url = normalizeCanonicalUrl(input.path);
  return {
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    name: input.name,
    description: input.description,
    url,
    inLanguage: "pt-BR",
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: input.items.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: normalizeCanonicalUrl(item.path),
        name: item.name,
        ...(item.description ? { description: item.description } : {}),
      })),
    },
  };
}

export function buildFaqSchema(faqs: FaqItem[]): SchemaNode {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}
