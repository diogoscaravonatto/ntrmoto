# NTR Escola de Motores — Portal & Funis (`paginas-ntrmoto`)

Portal unificado, landing pages de alta conversão, funis e suíte de calculadoras de engenharia da **NTR Escola de Motores**, construído com **Astro 7.4**, **Tailwind CSS v4.3** e deploy em **Cloudflare Workers Static Assets** via **`cf` CLI** (`cloudflare.config.ts`).

## Pré-requisitos

- **Node.js:** `>= 22.23.4` (recomendado Node 24 via `.nvmrc`)
- **pnpm:** `>= 10` (configurado com `pnpm@12.3.4`)

```bash
source "$HOME/.nvm/nvm.sh" && nvm use 24 >/dev/null && export PATH="$(dirname "$(nvm which 24)")":$PATH
pnpm install
```

## Scripts Disponíveis

| Comando                      | Descrição                                                               |
| ---------------------------- | ----------------------------------------------------------------------- |
| `pnpm run dev`               | Inicia servidor de desenvolvimento (`localhost:4321`)                   |
| `pnpm run dev:clean`         | Limpa cache Vite/Astro e inicia dev                                     |
| `pnpm run build`             | Build de produção (Static Assets puros em `./dist`)                     |
| `pnpm run build:timings`     | Build com métricas de tempo por etapa                                   |
| `pnpm run preview`           | Preview local do build                                                  |
| `pnpm run format`            | Formata código e ordena classes Tailwind via Oxfmt                      |
| `pnpm run format:check`      | Verifica formatação sem alterar arquivos                                |
| `pnpm run lint`              | Roda `oxlint --type-aware` (JS/TS) e `eslint .` (`.astro`)              |
| `pnpm run lint:fix`          | Auto-corrige problemas de lint                                          |
| `pnpm run check`             | Checagem de tipos (`astro check`)                                       |
| `pnpm run test`              | Suíte Vitest 5 (smoke de rotas, `no-global-leaks`, calculadoras)        |
| `pnpm run test:calculadoras` | Teste unitário standalone das 10 calculadoras                           |
| `pnpm run ci`                | Pipeline completo: `format:check` → `lint` → `check` → `test` → `build` |
| `pnpm run deploy:dry-run`    | Build + validação de deploy Cloudflare (`cf deploy ./dist --dry-run`)   |
| `pnpm run deploy`            | Build + deploy para Cloudflare Workers (`cf deploy ./dist`)             |
