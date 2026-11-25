import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Garante que nenhuma página em `src/pages/**` vaze seletores globais de chrome
 * (`html`, `body`, `:root`, `*`, `::selection`, `::-webkit-scrollbar`) via `<style is:global>`.
 */
const FORBIDDEN = [
  /^html\b/,
  /^body\b/,
  /^:root\b/,
  /^\*/,
  /^::selection\b/,
  /^::-webkit-scrollbar\b/,
];

function collectAstro(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectAstro(full));
    else if (entry.name.endsWith(".astro")) out.push(full);
  }
  return out;
}

function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function leakingSelectors(source: string): string[] {
  const leaks: string[] = [];
  const blockRe = /<style[^>]*\bis:global\b[^>]*>([\s\S]*?)<\/style>/g;
  for (const block of source.matchAll(blockRe)) {
    const css = stripCssComments(block[1]);
    for (const rule of css.matchAll(/([^{}]+)\{/g)) {
      const head = rule[1].trim();
      if (head.startsWith("@")) continue;
      for (const selector of head.split(",")) {
        const s = selector.trim();
        if (FORBIDDEN.some((re) => re.test(s))) leaks.push(s);
      }
    }
  }
  return leaks;
}

const pages = collectAstro("src/pages").toSorted();

describe("estilos: nenhuma página vaza chrome via is:global", () => {
  it("encontrou páginas .astro para varrer", () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  it.each(pages)("%s não tem seletor global de chrome", (file) => {
    const leaks = leakingSelectors(readFileSync(file, "utf8"));
    expect(
      leaks,
      `is:global vaza chrome em ${file}: [${leaks.join(", ")}]. ` +
        `Escope no wrapper ou mova para o layout.`,
    ).toEqual([]);
  });
});
