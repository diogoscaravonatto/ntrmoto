# AGENTS.md

Guia técnico para assistentes de IA operando no portal unificado de landing pages, funis e calculadoras da **NTR Escola de Motores** (`paginas-ntrmoto`).

---

## Visão Geral & Pré-requisitos

- **Stack:** Astro v7.4 (`output: "static"`), Tailwind CSS v4.3 (`@tailwindcss/vite`), Cloudflare Workers Static Assets via **`cf` CLI** (`cf/config` em `cloudflare.config.ts`, conta `a4bb04fd7222c7959ee07dbddf272a8e`, domínio `www.ntrmoto.com.br`).
- **Node.js obrigatório:** `>= 22.23.4` (`.nvmrc` define `24`). No macOS com NVM, garanta o Node 24 na frente do `PATH` (ex.: `source "$HOME/.nvm/nvm.sh" && nvm use 24 >/dev/null && export PATH="$(dirname "$(nvm which 24)")":$PATH`) antes de comandos `pnpm`/`node`/`astro`/`cf`.
- **Gerenciador de pacotes:** `pnpm` (`packageManager: pnpm@12.3.4`, `pnpm-workspace.yaml` com `onlyBuiltDependencies` para `esbuild`, `sharp` e `workerd`).
- **Idioma:** Todo conteúdo voltado ao usuário final e documentação é em `pt-BR` (exceto a rota `/ctx/es` em espanhol). Identificadores de código permanecem em inglês.

---

## Regra Crítica de Escopo — Projeto NTR Moto (OpenSEO Local)

- Siga integralmente as regras do workspace raiz em [`../AGENTS.md`](../AGENTS.md):
  - **NUNCA** use o MCP global `openseo` (conta da agência). Use **SEMPRE** o servidor MCP local **`openseo-ntr`** (`projectId: 8a8aedc3-d6df-4919-869e-d13180ad6efa`, GSC `sc-domain:ntrmoto.com.br`).
  - Priorize chamadas gratuitas (`0` créditos) e peça aprovação explícita antes de chamadas pagas.
  - Nunca exponha ou commite chaves/tokens (`.env`, `.agents/mcp_config.json`).

---

## Comandos Principais

```bash
pnpm run dev                # Servidor local em http://localhost:4321
pnpm run dev:clean          # Limpa cache e inicia dev
pnpm run build              # Build de produção (Static Assets puros em ./dist)
pnpm run build:timings      # Build com breakdown de tempo do Astro 7.4
pnpm run preview            # Preview local do build
pnpm run format             # Formata código + ordena classes Tailwind com Oxfmt
pnpm run format:check       # Verifica formatação com Oxfmt
pnpm run lint               # oxlint --type-aware (JS/TS) + eslint . (.astro + a11y)
pnpm run lint:fix           # Auto-correção de lint
pnpm run check              # Checagem TypeScript/Astro (astro check)
pnpm run test               # Suíte Vitest 5 (smoke de todas as rotas, no-global-leaks, calculadoras)
pnpm run test:calculadoras  # Script standalone das 10 calculadoras NTR
pnpm run ci                 # format:check -> lint -> check -> test -> build
pnpm run deploy:dry-run     # Build + cf deploy ./dist --dry-run
pnpm run deploy             # Build + cf deploy ./dist
pnpm run clean              # Limpa node_modules/.vite, dist, .astro
```

---

## Arquitetura e Particularidades da NTR Moto

1. **Cloudflare `cf` CLI + Static Assets Puros (`cloudflare.config.ts`):**
   - Este projeto usa exclusivamente **`cf` CLI** (sem `wrangler.jsonc` e sem `@astrojs/cloudflare`, já que todas as 28 rotas são pré-renderizadas em `./dist`).
   - Para publicar ou validar, use `pnpm run deploy:dry-run` (`cf deploy ./dist --dry-run`) e `pnpm run deploy` (`cf deploy ./dist`). Não crie `wrangler.jsonc`.
   - Para comandos de conta/zona/DNS/observabilidade, use `cf cli search "<tarefa>"`, `cf <comando> --help` e `cf auth whoami`.
2. **Páginas Nativas Astro vs Legadas SwipePages:**
   - Páginas modernas e funis principais vivem em `src/pages/` + `src/components/` usando `BaseLayout.astro` ou `CalculadoraLayout.astro`.
   - 14 rotas migradas do SwipePages operam via wrappers `<Fragment set:html={rawHtml} />` lendo `src/legacy-swipepages/*.html` com assets estáticos locais em `public/legacy-sp/`. Não converta ou remova esses arquivos sem solicitação explícita.
3. **Suíte de 10 Calculadoras NTR (`src/utils/calculadoras-ntr.ts`):**
   - Toda alteração nas fórmulas matemáticas deve manter 100% de compatibilidade com `tests/calculadoras.test.ts` e `scripts/test-calculadoras.mjs`.
4. **Embeds na Cademi (`public/_headers`):**
   - As rotas `/embed*`, `/embededcalc1*` e `/embededcalc2*` removem `X-Frame-Options` (`! X-Frame-Options`) e aplicam `Content-Security-Policy: upgrade-insecure-requests; frame-ancestors 'self' https://alunos.escolademotores.com.br https://core.cademi.com.br https://*.cademi.com.br;` + `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet`. **Nunca** remova essas regras.
5. **Rastreamento Stape GTM & Conversão (`BaseLayout.astro`):**
   - O GTM oficial da NTR (`PUBLIC_GTM_ID`, padrão `GTM-WPK87RPH`) carrega via Stape (`stape.escolademotores.com.br`) diretamente no `<head>` (sem Partytown e sem `<ClientRouter />`) para preservar disparo imediato de Pixel/CAPI/UTMify e scripts inline das LPs.
6. **Astro 7 Native Fonts API + `session: false`:**
   - Fontes (`Inter`, `Space Grotesk`, `JetBrains Mono`) são baixadas em build-time via `fonts` em `astro.config.mjs` e renderizadas com `<Font />` + `@theme inline` em `src/styles/global.css`.
7. **TypeScript `~5.9.3`:**
   - Mantenha `typescript` travado em `~5.9.3` (exigido por `@astrojs/check` e `oxlint-tsgolint`).

---

## Linting, Formatação e Skills

- **Híbrido Oxlint + ESLint 10:** `oxlint --type-aware` valida `.js`/`.ts`; `eslint .` valida exclusivamente `**/*.astro` (incluindo `jsx-a11y` e `no-unused-css-selector`).
- **Oxfmt:** formata JS/TS/CSS/JSON/Markdown/`.astro` e ordena classes Tailwind v4.
- **MCPs:** `.mcp.json` configura `astro-docs` (`https://mcp.docs.astro.build/mcp`).
- **Skills (32 instaladas em `.agents/skills/`, espelhadas via symlink em `.claude/skills`):**
  - **Cloudflare (14):** `agents-sdk`, `cf-cli`, `cloudflare`, `cloudflare-email-service`, `cloudflare-one`, `cloudflare-one-migrations`, `durable-objects`, `frameworks-on-cloudflare`, `sandbox-sdk`, `turnstile-spin`, `web-perf`, `workers-best-practices`, `workers-development`, `wrangler`.
  - **Astro & Plataforma Web Moderna (6):** `astro`, `modern-web-guidance`, `tailwindcss`, `vite`, `vitest`, `pnpm`.
  - **Design & UI/UX (3):** `sniper-ui-design-styles`, `ui-ux-pro-max`, `web-design-guidelines`.
  - **CRO, SEO & Tracking (9):** `analytics-tracking`, `audit-website`, `copywriting`, `marketing-ideas`, `marketing-psychology`, `page-cro`, `popup-cro`, `schema-markup`, `seo-audit`.
