import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { enhanceLegacyHtml } from "../src/utils/legacy-seo";
import {
  buildBreadcrumbSchema,
  buildCourseSchema,
  buildOrganizationSchema,
  normalizeCanonicalUrl,
} from "../src/utils/seo";

const PAGES_DIR = "src/pages";
const REDIRECTS_PATH = "public/_redirects";

function walkAstro(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkAstro(full));
    else if (entry.name.endsWith(".astro")) out.push(full);
  }
  return out;
}

function getPageRouteSet(): Set<string> {
  const routes = new Set<string>();
  for (const file of walkAstro(PAGES_DIR)) {
    const rel = file.slice(PAGES_DIR.length).replace(/\.astro$/, "");
    const normalized = rel === "/index" ? "/" : rel.replace(/\/index$/, "/");
    routes.add(normalized);
  }
  return routes;
}

describe("SEO e Redirects 301 em public/_redirects", () => {
  it("normaliza canonicals com barra final consistente", () => {
    expect(normalizeCanonicalUrl("/")).toBe("https://www.ntrmoto.com.br/");
    expect(normalizeCanonicalUrl("/cursos/formacao-pro")).toBe(
      "https://www.ntrmoto.com.br/cursos/formacao-pro/",
    );
    expect(normalizeCanonicalUrl("/cursos/formacao-pro/?utm_source=blog")).toBe(
      "https://www.ntrmoto.com.br/cursos/formacao-pro/",
    );
  });

  it("valida sintaxe, pares com/sem barra e destinos existentes em public/_redirects", () => {
    expect(existsSync(REDIRECTS_PATH)).toBe(true);
    const routes = getPageRouteSet();
    const lines = readFileSync(REDIRECTS_PATH, "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));

    expect(lines.length).toBeGreaterThanOrEqual(40);

    const sources = new Set<string>();
    const protectedPrefixes = [
      "/embed",
      "/embededcalc1",
      "/embededcalc2",
      "/convite",
      "/calculadora-up",
    ];

    for (const line of lines) {
      const parts = line.split(/\s+/);
      expect(parts, `Linha inválida em _redirects: ${line}`).toHaveLength(3);
      const [src, dest, code] = parts;
      expect(src.startsWith("/")).toBe(true);
      expect(dest.startsWith("/")).toBe(true);
      expect(dest.endsWith("/")).toBe(true);
      expect(code).toBe("301");
      expect(routes.has(dest), `Destino inexistente em src/pages: ${dest}`).toBe(true);
      expect(
        protectedPrefixes.some((prefix) => src.startsWith(prefix)),
        `Rota protegida não deve ser redirecionada: ${src}`,
      ).toBe(false);
      expect(sources.has(src), `Origem duplicada em _redirects: ${src}`).toBe(false);
      sources.add(src);
    }

    for (const src of sources) {
      const counterpart = src.endsWith("/") ? src.slice(0, -1) : `${src}/`;
      expect(sources.has(counterpart), `Falta par sem/com barra para ${src}`).toBe(true);
    }
  });

  it("enhanceLegacyHtml corrige canonical, title/description, JSON-LD e h1 único sem alterar SVGs", () => {
    const proRaw = readFileSync("src/legacy-swipepages/pro.html", "utf8");
    const proOut = enhanceLegacyHtml(proRaw, {
      canonicalPath: "/cursos/formacao-pro/",
      title: "Formação PRO NTR | Teste",
      description: "Descrição oficial da Formação PRO.",
      ogImage: "/images/mockup_combo.webp",
      headingFix: { promoteFirstHeading: { fromTag: "h2", contains: "Domine todas" } },
      schema: [
        buildOrganizationSchema(),
        buildBreadcrumbSchema([
          { name: "Início", path: "/" },
          { name: "Cursos", path: "/cursos/" },
          { name: "Formação PRO", path: "/cursos/formacao-pro/" },
        ]),
        buildCourseSchema({
          name: "Formação PRO NTR",
          description: "Descrição oficial da Formação PRO.",
          path: "/cursos/formacao-pro/",
          price: "599.00",
        }),
      ],
    });

    expect(proOut).toContain(
      '<link rel="canonical" href="https://www.ntrmoto.com.br/cursos/formacao-pro/" />',
    );
    expect(proOut).toContain("<title>Formação PRO NTR | Teste</title>");
    expect(proOut).toContain('<script type="application/ld+json">');
    expect((proOut.match(/<h1\b/gi) ?? []).length).toBe(1);

    const cabecoteRaw = readFileSync("src/legacy-swipepages/curso-cabecote-v02.html", "utf8");
    const cabecoteOut = enhanceLegacyHtml(cabecoteRaw, {
      canonicalPath: "/cursos/preparacao-de-cabecotes/",
      title: "Curso Expert em Cabeçotes",
      description: "Aprenda a preparar cabeçotes de alta vazão em 3 passos.",
      ogImage: "/legacy-sp/media/821ff8be22ca-cabecotes-1.png",
      headingFix: {
        demoteHeading: { fromTag: "h1", toTag: "h2", contains: "Presentes Exclusivos" },
      },
    });
    expect(cabecoteOut).not.toContain("alta aazão");
    expect((cabecoteOut.match(/<h1\b/gi) ?? []).length).toBe(1);

    const comandosRaw = readFileSync("src/legacy-swipepages/combo-comandos-4em1pro.html", "utf8");
    const comandosOut = enhanceLegacyHtml(comandosRaw, {
      canonicalPath: "/cursos/comandos-de-valvulas/",
      title: "Combo Comandos 4 em 1 PRO",
      description: "4 cursos completos de comandos.",
      ogImage: "/images/mockup_combo.webp",
      headingFix: { promoteFirstHeading: { fromTag: "h3", contains: "Aprenda tudo sobre" } },
    });
    expect((comandosOut.match(/<h1\b/gi) ?? []).length).toBe(1);
    expect(comandosOut).toContain("<title>arrow-bold-down</title>");
  });
});
