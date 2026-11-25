/**
 * Setup HÍBRIDO oxlint + ESLint (domínios DISJUNTOS, sem sobreposição):
 * - oxlint (.oxlintrc.json) linta tudo MENOS `.astro` (JS/TS) — rápido, em Rust.
 * - ESLint linta APENAS os templates `.astro`, onde ficam as regras de
 *   a11y/segurança/CSS que o oxlint ainda não cobre.
 */
import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default [
  // 1. Recommended do Astro — configura o parser do .astro e as regras-base.
  ...eslintPluginAstro.configs.recommended,

  // 2. Regras de acessibilidade (A11Y) otimizadas para Astro.
  ...eslintPluginAstro.configs["jsx-a11y-recommended"],

  // 3. Regras específicas dos templates .astro.
  {
    files: ["**/*.astro"],
    plugins: { "@typescript-eslint": tseslint.plugin },
    rules: {
      // --- Acessibilidade ---
      "astro/jsx-a11y/alt-text": "error",
      "astro/jsx-a11y/anchor-is-valid": "error",
      "astro/jsx-a11y/no-autofocus": "warn",
      "astro/jsx-a11y/label-has-associated-control": "error",
      "astro/jsx-a11y/click-events-have-key-events": "warn",
      "astro/jsx-a11y/no-static-element-interactions": "warn",

      // --- Segurança e qualidade ---
      "astro/no-set-html-directive": "warn",
      "astro/no-unused-css-selector": "error",
      "astro/prefer-class-list-directive": "warn",
      "astro/no-conflict-set-directives": "error",
      "astro/no-prerender-export-outside-pages": "error",

      // --- TypeScript no frontmatter .astro ---
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },

  // 4. Exceção: wrappers legados importados do SwipePages e BaseLayout (JSON-LD) usam set:html.
  {
    files: [
      "src/layouts/BaseLayout.astro",
      "src/pages/aulas/cambio-e-velocidade-final/index.astro",
      "src/pages/calculadora-up/index.astro",
      "src/pages/cursos/comandos-de-valvulas/index.astro",
      "src/pages/cursos/curso-rapido-preparacao/index.astro",
      "src/pages/cursos/formacao-pro/index.astro",
      "src/pages/cursos/preparacao-de-cabecotes/index.astro",
      "src/pages/embededcalc1/index.astro",
      "src/pages/embededcalc2/index.astro",
      "src/pages/ferramentas/calculadora-de-motores/index.astro",
      "src/pages/projetos/guia-motores-preparados/index.astro",
    ],
    rules: {
      "astro/no-set-html-directive": "off",
    },
  },

  // 5. Ignorados (domínio exclusivo .astro; JS/TS fica com oxlint).
  {
    ignores: [
      "dist/",
      ".astro/",
      ".wrangler/",
      ".cloudflare/",
      "node_modules/",
      "public/",
      "src/legacy-swipepages/",
      "**/*.js",
      "**/*.mjs",
      "**/*.ts",
    ],
  },
];
