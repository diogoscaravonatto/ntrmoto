import { describe, it, expect, inject } from "vitest";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const BASE = inject("smokeBaseUrl");
const PAGES_DIR = "src/pages";

/** Marcadores de erro de runtime que NUNCA devem aparecer numa página renderizada. */
const RUNTIME_ERROR =
  /module is not defined|require is not defined|Internal server error|ReferenceError|Cannot find package/i;

/** Lista recursiva de arquivos de página. */
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(astro|md|mdx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

/** Converte caminho de arquivo em rota URL. Pula dinâmicas ([...]) e páginas de erro. */
function toRoute(file: string): string | null {
  const rel = file.slice(PAGES_DIR.length).replace(/\.(astro|md|mdx)$/, "");
  if (rel.includes("[")) return null;
  if (/\/(404|500)$/.test(rel)) return null;
  return rel.replace(/\/index$/, "") || "/";
}

const routes = [
  ...new Set(
    walk(PAGES_DIR)
      .map(toRoute)
      .filter((r): r is string => r !== null),
  ),
].toSorted();

describe("smoke: toda rota renderiza sem erro de servidor", () => {
  it("descobriu rotas estáticas", () => {
    expect(routes.length).toBeGreaterThan(0);
  });

  it.each(routes)("GET %s → 200 e sem erro de runtime", async (route) => {
    const res = await fetch(BASE + route);
    const body = await res.text();
    expect(res.status, `${route} retornou HTTP ${res.status}`).toBe(200);
    expect(RUNTIME_ERROR.test(body), `${route} contém erro de runtime no HTML`).toBe(false);
  });

  it("GET rota inexistente → 404 com página NTR", async () => {
    const res = await fetch(`${BASE}/rota-inexistente-404-smoke`);
    const body = await res.text();
    expect(res.status).toBe(404);
    expect(body).toContain("NTR Escola de Motores");
  });
});
