# Dossiê Técnico de Unificação — NTR Escola de Motores (`www.ntrmoto.com.br`)

- **Data de consolidação:** 24/11/2026
- **Repositório unificado:** `paginas-ntrmoto` (Worker `paginas-ntrmoto` na conta Cloudflare `NTR Moto`)
- **Domínio canônico de páginas/vendas:** `https://www.ntrmoto.com.br`
- **Blog editorial (repositório irmão `blog-ntrmoto`):** `https://blog.ntrmoto.com.br`

---

## 1. Resumo Executivo e Objetivo da Unificação

Historicamente, os ativos web da **NTR Escola de Motores** (`NTR Treinamentos Ltda`) estavam fragmentados entre dois domínios e três infraestruturas diferentes:

1. **Cloudflare Pages (`ntr-lp`):** servia simultaneamente `lp.escolademotores.com.br` e `www.ntrmoto.com.br` com páginas Astro criadas recentemente (`/`, `/clube/`, `/ctx/`, `/r4t-v02/`, `/bf26/`, etc.).
2. **SwipePages (`www.escolademotores.com.br`):** hospedava 14 páginas de vendas e captura legadas (`/pro`, `/calculadora-pv1`, `/curso-cabecote-v02`, `/combo-comandos-4em1pro`, `/crp-pv11`, `/gmp-lp11`, `/aula-cambio`, etc.).
3. **Cloudflare Workers (`blog-ntrmoto`):** blog EmDash CMS em `blog.ntrmoto.com.br` com 30 artigos publicados.

### Estratégia adotada (Zero-Downtime)

- **Fase 1 (concluída):** Isolamento completo de `www.ntrmoto.com.br` no Worker **`paginas-ntrmoto`** (Cloudflare Workers Static Assets), preservando `lp.escolademotores.com.br` intacto no Pages `ntr-lp` e com snapshot congelado no Worker `escolademotores-lp` (e na branch `escolademotores-lp`).
- **Fase 2 (concluída):** Importação das **14 páginas ativas do SwipePages** que ainda não existiam em `paginas-ntrmoto` (12 de vendas/captura + 2 embeds da Calculadora na Área de Membros Cademi), mantendo **exatamente os mesmos slugs** e localizando **796 assets únicos** (`26,56 MB`) em `public/legacy-sp/` para eliminar a dependência futura do CDN do SwipePages.
- **Fase 2.5 — Suíte Nativa da Calculadora (concluída):** Extração das **10 fórmulas oficiais do Calconic** e recriação nativa em Astro + Tailwind v4 + SVG animado em **`https://www.ntrmoto.com.br/embed-calculadora/`** (`noindex, nofollow`, `X-Robots-Tag`, `frame-ancestors` Cademi), pronta para substituir `/embededcalc1/` e `/embededcalc2/` quando validada.
- **Fases 3 e 4 (planejadas):** Refatoração gradual para Astro/Tailwind nativo, atualização dos links do blog/home para `www.ntrmoto.com.br`, virada de campanhas pagas e criação de Redirects 301 rota a rota antes de desligar SwipePages e `ntr-lp`.

---

## 2. Mapa Completo da Infraestrutura (Cloudflare, DNS, Workers, Pages, SwipePages e Cademi)

Conta Cloudflare: **`NTR Moto`** (`a4bb04fd7222c7959ee07dbddf272a8e`)

| Host / Subdomínio               | Serviço / Destino Atual                                             | Status na Migração           | Regra Operacional                                                                      |
| :------------------------------ | :------------------------------------------------------------------ | :--------------------------- | :------------------------------------------------------------------------------------- |
| `www.ntrmoto.com.br`            | Worker `paginas-ntrmoto` (Workers Static Assets)                    | **Ativo (Unificado)**        | Portal principal de LPs, embeds da Calculadora e vendas (**26 rotas**).                |
| `ntrmoto.com.br`                | Redirect Rule 301 → `https://www.ntrmoto.com.br/`                   | **Ativo**                    | **NÃO MEXER** no registro DNS nem na regra 301.                                        |
| `blog.ntrmoto.com.br`           | Worker `blog-ntrmoto` (Astro SSR + EmDash + D1 + R2)                | **Ativo**                    | Blog oficial (30 artigos). Na Fase 3B terá CTAs atualizados para `www.ntrmoto.com.br`. |
| `tracking.ntrmoto.com.br`       | CNAME → `san.stape.io` (proxied)                                    | **Ativo**                    | Infraestrutura de tracking server-side da NTR. **NÃO MEXER.**                          |
| `arquivos.ntrmoto.com.br`       | CNAME → `public.r2.dev` (proxied)                                   | **Ativo**                    | Arquivos públicos R2. **NÃO MEXER.**                                                   |
| `link.ntrmoto.com.br`           | CNAME → `links.switchy.io`                                          | **Ativo**                    | Encurtador de links. **NÃO MEXER.**                                                    |
| `sp.ntrmoto.com.br`             | CNAME → `hosted.clkdmg.site`                                        | Legado                       | DNS externo; **NÃO MEXER** sem validar uso.                                            |
| `lp.escolademotores.com.br`     | Cloudflare Pages `ntr-lp` _(backup no Worker `escolademotores-lp`)_ | **Congelado / Tráfego Pago** | **NÃO MEXER** até a Fase 4 (recebe anúncios ativos).                                   |
| `www.escolademotores.com.br`    | SwipePages (`zone2.swipepages.net` / BunnyCDN)                      | **Ativo / Legado**           | **NÃO MEXER** até concluir Fases 3 e 4 e validar Cademi/anúncios.                      |
| `alunos.escolademotores.com.br` | CNAME → `core.cademi.com.br` (Área de Membros)                      | **Crítico / Produção**       | **NÃO MEXER.** Área de membros onde alunos acessam cursos e a Calculadora.             |
| `stape.escolademotores.com.br`  | CNAME → `san.stape.io` (proxied)                                    | **Crítico / Tracking**       | **NÃO MEXER.** Container Stape do GTM (`GTM-WPK87RPH`) usado pelas LPs.                |
| `server.escolademotores.com.br` | A/AAAA → Google Frontend (`216.239.32-38.21`)                       | **Ativo / Externo**          | **NÃO MEXER** (serviço externo no Google Cloud).                                       |
| `pixel.escolademotores.com.br`  | CNAME → `pixel.eduzz.com`                                           | **Ativo / Checkout**         | **NÃO MEXER.** Rastreamento Eduzz.                                                     |
| `greenn.escolademotores.com.br` | CNAME → `pixel.greenn.com.br`                                       | **Ativo / Checkout**         | **NÃO MEXER.** Rastreamento Greenn.                                                    |

---

## 3. Alerta Crítico — Calculadora de Motores e Área de Membros (`alunos.escolademotores.com.br` / Cademi)

> **ATENÇÃO:** As páginas `/calculadora-pv1`, `/calculadora-pv2` e `/calculadora-up` são **páginas de vendas/upsell**. O aplicativo da Calculadora acessado pelos alunos dentro da **Cademi (`alunos.escolademotores.com.br`)** funciona por meio de **duas páginas incorporadas** hospedadas originalmente no SwipePages (`www.escolademotores.com.br/embededcalc1` e `www.escolademotores.com.br/embededcalc2`), já importadas para `www.ntrmoto.com.br`:

### 3.1. Páginas incorporadas da Calculadora já importadas para `www.ntrmoto.com.br`

1. **`https://www.ntrmoto.com.br/embededcalc1/`**
   - Título original: _"Calculadora de Motores - Embeded Conta 1 - 10k"_
   - Contém **9 iframes** da plataforma **Calconic** (`app.calconic.com/api/embed/calculator/...`) + script de integração Cademi (`https://core.cademi.com.br/assets/js/remote.js`).
2. **`https://www.ntrmoto.com.br/embededcalc2/`**
   - Título original: _"Calculadora de Motores - Embeded Conta 2 - 50k"_
   - Contém **10 iframes** da plataforma **Calconic** + script de integração Cademi (`https://core.cademi.com.br/assets/js/remote.js`).

### 3.2. Política permanente de não-indexação e headers para `<iframe>` (`public/_headers`)

1. **Bloqueio de indexação para embeds (`/embed*`, `/embededcalc1/`, `/embededcalc2/`) e páginas de funil (`/convite/`, `/calculadora-up/`):**
   - Header HTTP `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` em `public/_headers` (cobrindo automaticamente qualquer rota `/embed*`).
   - Meta tag `<meta name="robots" content="noindex, nofollow" />` no HTML.
   - Exclusão automática do `sitemap-0.xml` em `astro.config.mjs` (qualquer URL contendo `/embed`, além de `/convite/` e `/calculadora-up/`).
   - **Sem `Disallow` no `robots.txt`:** seguindo a prática recomendada pelo Google, essas rotas não são bloqueadas no `robots.txt` justamente para que o crawler possa lê-las, enxergar o `X-Robots-Tag` / `<meta name="robots" content="noindex">` e removê-las completamente do índice.
2. **Permissão de `<iframe>` para a Cademi:**
   - Globalmente, `public/_headers` aplica `X-Frame-Options: SAMEORIGIN` em `/*`. Para impedir que a Cademi seja bloqueada ao incorporar a Calculadora, `/embed*`, `/embededcalc1`, `/embededcalc1/`, `/embededcalc2` e `/embededcalc2/` desanexam (`!`) `X-Frame-Options` e sobrescrevem `Content-Security-Policy` com:
     ```txt
     Content-Security-Policy: upgrade-insecure-requests; frame-ancestors 'self' https://alunos.escolademotores.com.br https://core.cademi.com.br https://*.cademi.com.br;
     ```

### 3.3. Checklist obrigatório na Cademi e oportunidade na Fase 3+

1. **Troca segura na Cademi:** atualizar os embeds das aulas da Calculadora em `alunos.escolademotores.com.br` para `https://www.ntrmoto.com.br/embededcalc1/` e `https://www.ntrmoto.com.br/embededcalc2/` e testar como aluno **antes** de desativar `www.escolademotores.com.br` no SwipePages (mantendo ainda Redirect 301 nas URLs antigas durante a transição).
2. **Verificar se há outros links internos na Cademi** (suporte, upsell ou materiais complementares) apontando para `escolademotores.com.br`.
3. **Suíte nativa já construída (`/embed-calculadora/`):** as **10 calculadoras da NTR** (9 ativas da Conta 1 + `Volume da Câmara`) já foram recriadas em Astro nativo (`src/utils/calculadoras-ntr.ts` + `src/components/calculadoras/`) em **`https://www.ntrmoto.com.br/embed-calculadora/`** (protegida com `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet`, fora do sitemap e com `frame-ancestors` para Cademi), pronta para substituir os embeds do Calconic quando validada por você.

### 3.4. Fórmulas Matemáticas Oficiais Extraídas do Calconic (`src/utils/calculadoras-ntr.ts`)

| #   | Calculadora                      | ID Calconic Original       | Fórmula Exata                                                                                                                                             | Precisão / Unidade |
| :-- | :------------------------------- | :------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------- |
| 1   | Cilindrada                       | `5bc78917cd1547001b53339b` | `((bore * bore) * stroke * 3.1416) / 4000`                                                                                                                | `2` casas, `cc`    |
| 2   | Taxa de Compressão               | `666cf45d982fb4002a0feca4` | `(cc + volumeMl) / volumeMl`                                                                                                                              | `2` casas, `:1`    |
| 3   | Volume da Câmara                 | `5bc94204cabfa1001b0ba006` | `cc / (taxaEstatica - 1)`                                                                                                                                 | `2` casas, `ml`    |
| 4   | Relação R/L                      | `6669ef81982fb4002afc595d` | `(stroke / 2) / rodLength`                                                                                                                                | `2` casas          |
| 5   | Velocidade Média do Pistão (VMP) | `6669f336982fb4002afc790a` | `(rpm * stroke) / 30000`                                                                                                                                  | `2` casas, `m/s`   |
| 6   | Carburador / TBI                 | `5bc94423cabfa1001b0ba007` | `carb = sqrt((cc / 1000) * rpm) * (65 / 100)` · `tbi = (carb * 10 / 100) + carb`                                                                          | `1` casa, `mm`     |
| 7   | Aumento de Válvulas 2V           | `5ea6d2384d75890029d21e52` | `pctCC = ((cc * 100) / 150) - 100` · `pctV = (pctCC * 5)/35` (≤270cc) ou `(pctCC * 10)/35` (≥271cc) · `adm = 30*(pctV/100)+30` · `esc = 26*(pctV/100)+26` | `1` casa, `mm`     |
| 8   | Aumento de Válvulas 4V           | `6669f72b982fb4002afc9aef` | `pctCC = ((cc * 100) / 250) - 100` · `pctV = (pctCC * 7)/35` · `adm = 28*(pctV/100)+28` · `esc = 23.5*(pctV/100)+23.5`                                    | `1` casa, `mm`     |
| 9   | Dutos Cabeçote 2V                | `666d9c3a982fb4002a12cb30` | `adm = sedeAdm * (948 / 1000)` · `esc = sedeEsc * (1095 / 1000)`                                                                                          | `2` casas, `mm`    |
| 10  | Dutos Cabeçote 4V                | `666d9f5a982fb4002a12e0ba` | `adm = sedeAdm * (1342 / 1000)` · `esc = sedeEsc * (1549 / 1000)`                                                                                         | `2` casas, `mm`    |

---

## 4. Inventário Completo das 26 Páginas em `https://www.ntrmoto.com.br`

### 4.1. Bloco A — 12 Páginas Nativas Astro (Fase 1 + Suíte Calculadoras)

| Rota                  | Arquivo                                   | Finalidade                                       | Observações                                                          |
| :-------------------- | :---------------------------------------- | :----------------------------------------------- | :------------------------------------------------------------------- |
| `/`                   | `src/pages/index.astro`                   | Home institucional da NTR Escola de Motores      | Modular (`src/components/home/`).                                    |
| `/clube/`             | `src/pages/clube/index.astro`             | Clube de Preparadores NTR (Black Friday Oficial) | Página monolítica Astro (2.485 linhas).                              |
| `/bf26/`              | `src/pages/bf26/index.astro`              | Pré-inscrição / Grupo VIP Black Vitalícia        | `Cache-Control: no-store` em `public/_headers`.                      |
| `/bf26-inscricoes/`   | `src/pages/bf26-inscricoes/index.astro`   | Página de vendas Black Vitalícia 2026            | Checkout Eduzz (`chk.eduzz.com/8017JO4Q07`).                         |
| `/combo-black/`       | `src/pages/combo-black/index.astro`       | Combo NTR Vitalício                              | Modular (`src/components/combo-black/`).                             |
| `/ctx/`               | `src/pages/ctx/index.astro`               | Curso Taxa de Compressão (com seletor PT/ES)     | Modular (`src/components/ctx/`).                                     |
| `/ctx/pt/`            | `src/pages/ctx/pt/index.astro`            | Curso Taxa de Compressão (Brasil — PT)           | Modular (`src/components/ctx/`).                                     |
| `/ctx/es/`            | `src/pages/ctx/es/index.astro`            | Curso Tasa de Compresión (LATAM — ES)            | `lang="es"`, modular (`src/components/ctx/es/`).                     |
| `/r4t-v01/`           | `src/pages/r4t-v01/index.astro`           | Projeto 32cv — Rei do 4Trinho (V1)               | Modular (`src/components/`).                                         |
| `/r4t-v02/`           | `src/pages/r4t-v02/index.astro`           | Projeto 32cv — Rei do 4Trinho (V2)               | Modular (`src/components/v02/`).                                     |
| `/convite/`           | `src/pages/convite/index.astro`           | Etapa intermediária VSL (Etapa 2 de 3)           | `noindex, nofollow` + `X-Robots-Tag` + fora do sitemap.              |
| `/embed-calculadora/` | `src/pages/embed-calculadora/index.astro` | Suíte nativa de 10 Calculadoras NTR              | `noindex, nofollow` + `X-Robots-Tag` + `CSP frame-ancestors` Cademi. |

### 4.2. Bloco B — 14 Páginas Importadas do SwipePages (`www.escolademotores.com.br`)

Todas foram salvas em `src/legacy-swipepages/<slug>.html` com wrapper `src/pages/<slug>/index.astro`, `lang="pt-BR"`, `<link rel="canonical">` apontando para `https://www.ntrmoto.com.br/<slug>/` e assets localizados em `/legacy-sp/`.

| Rota                       | Título                                         | HTML     | Assets Locais | Checkouts Eduzz / Embeds                                           | Tracking                  | Form SwipePages | Observações / Equivalente Astro                                                       |
| :------------------------- | :--------------------------------------------- | :------- | :------------ | :----------------------------------------------------------------- | :------------------------ | :-------------- | :------------------------------------------------------------------------------------ |
| `/pro/`                    | Curso de Preparação de Motores Método NTR      | 184,2 KB | 289           | Eduzz `1121929?dv=1`, `E9OO1GQV9B`                                 | Stape + Utmify            | **Sim**         | Money Page principal (Formação PRO). `og:image` fallback local.                       |
| `/combo-comandos-4em1pro/` | Super Combo Comandos 4em1                      | 84,1 KB  | 102           | Eduzz `1686735`, `G92V22EO9E`                                      | `GTM-W4DNLLD` (sem Stape) | **Sim**         | Money Page Combo Comandos. Requer migração do GTM legado na Fase 3.                   |
| `/curso-cabecote-v02/`     | Curso de Preparação de Cabeçote                | 88,9 KB  | 125           | Eduzz `816463`                                                     | Stape                     | Não             | Money Page Expert em Cabeçotes.                                                       |
| `/crp-pv11/`               | Conteúdo Proibido para Preparadores Bonzinhos  | 104,2 KB | 129           | Eduzz `797936`                                                     | Stape                     | Não             | Money Page Curso Rápido de Preparação (CRP).                                          |
| `/calculadora-pv1/`        | Calculadora de Motores NTR                     | 112,8 KB | 106           | Eduzz `1121929?dv=1`, `E0D6EJX691` + PandaVideo `9c4efdfa-...`     | Stape                     | **Sim**         | Money Page principal da Calculadora (com VSL PandaVideo).                             |
| `/calculadora-pv2/`        | Calculadora de Motores NTR                     | 73,8 KB  | 107           | Eduzz `1121929?dv=1`, `E0D6EJX691` + PandaVideo `9c4efdfa-...`     | Stape                     | Não             | Variante V2 referenciada pela Home (`Courses.astro`).                                 |
| `/calculadora-up/`         | Curso de Preparação Super Motores              | 62,5 KB  | 77            | Eduzz `1121929?dv=1`, `E0D6EJX691?u=1` + PandaVideo `9c4efdfa-...` | Stape + Utmify            | Não             | Upsell pós-compra (`noindex, nofollow` + fora do sitemap). `og:image` fallback local. |
| `/gmp-lp11/`               | Guia de Motores Preparados - lp11              | 106,0 KB | 127           | Eduzz `1686735`, `1901654`                                         | Stape                     | **Sim**         | Money Page principal do Guia de Motores Preparados (GMP).                             |
| `/gmp/`                    | Guia de Motores Preparados                     | 107,5 KB | 85            | Eduzz `1686735`                                                    | Stape                     | **Sim**         | Variante curta do slug `/gmp` (possível consolidação na Fase 3).                      |
| `/ctx-pv5/`                | Curso Rápido Taxa de Compressão                | 132,7 KB | 124           | Eduzz `2191231`, `2377783`                                         | Stape                     | **Sim**         | Money Page SwipePages do CTX (coexiste com `/ctx/` Astro).                            |
| `/ctx-pv6/`                | Curso Rápido Taxa de Compressão                | 129,4 KB | 126           | Eduzz `2191231`, `2377783`                                         | Stape                     | **Sim**         | Variante do CTX no SwipePages (coexiste com `/ctx/` Astro).                           |
| `/aula-cambio/`            | Aula Planilha de Câmbio e Relação              | 17,9 KB  | 22            | PandaVideo `ce2f965a-...`                                          | —                         | Não             | Isca gratuita (aula aberta). Sem Stape; `og:image` fallback local.                    |
| `/embededcalc1/`           | Calculadora de Motores - Embeded Conta 1 - 10k | 28,2 KB  | 38            | 9 iframes Calconic + `cademi remote.js`                            | —                         | Não             | Embed Área de Membros Cademi (`noindex`, fora do sitemap, `CSP frame-ancestors`).     |
| `/embededcalc2/`           | Calculadora de Motores - Embeded Conta 2 - 50k | 27,5 KB  | 38            | 10 iframes Calconic + `cademi remote.js`                           | —                         | Não             | Embed Área de Membros Cademi (`noindex`, fora do sitemap, `CSP frame-ancestors`).     |

### 4.3. Páginas do SwipePages propositalmente não sobrescritas

- `/` (`www.escolademotores.com.br/`) — mantida a Home nativa Astro em `www.ntrmoto.com.br/`.
- `/clube` (`www.escolademotores.com.br/clube`) — era versão antiga do Clube; mantida a versão oficial Astro em `www.ntrmoto.com.br/clube/`.

---

## 5. Pendências Técnicas Antes de Cancelar o SwipePages

1. **Formulários legados do SwipePages (`https://app.swipepages.com/api/leads`):**
   - Estão presentes em **7 páginas**: `/pro/`, `/combo-comandos-4em1pro/`, `/calculadora-pv1/`, `/gmp-lp11/`, `/gmp/`, `/ctx-pv5/` e `/ctx-pv6/`.
   - Enquanto o SwipePages estiver ativo, esses formulários continuam enviando leads para a API do SwipePages, mas ao cancelar a assinatura eles deixarão de funcionar. **Antes do cancelamento, cada página com captura deve ter o formulário substituído** (por integração própria, webhook/Worker, ou remoção se não estiver em uso) durante a refatoração da Fase 3.
2. **Consolidação de Tracking (Zaraz + GTM Stape + GTM legado + Utmify):**
   - O domínio `ntrmoto.com.br` possui Cloudflare Zaraz (`G-QFTMGBKH7L`) na borda, enquanto as LPs usam GTM via `stape.escolademotores.com.br` (`GTM-WPK87RPH`).
   - Exceções identificadas no manifesto:
     - `/combo-comandos-4em1pro/` ainda usa o container GTM antigo `GTM-W4DNLLD` (sem Stape).
     - `/aula-cambio/` não possui nenhum script GTM/Stape no `<head>`.
     - `/pro/` e `/calculadora-up/` carregam também `cdn.utmify.com.br`.
3. **Fontes antigas e `og:image` 403 do SwipePages:**
   - Fontes `.eot` e `.svg#...` legadas do SwipePages foram removidas das regras `@font-face` (mantendo `.woff`, `.ttf` e `.otf` locais em `/legacy-sp/fonts/`).
   - 2 URLs antigas de `og:image` em `media.swipepages.com` retornaram `HTTP 403` na origem (`/pro/`, `/calculadora-up/` e `/aula-cambio/`) e foram automaticamente apontadas para `https://www.ntrmoto.com.br/images/mockup_combo.webp`. Na Fase 3, recomenda-se gerar imagens `og:image` dedicadas (1200×630) para cada produto.
4. **Limitações de tamanho (Workers Static Assets):**
   - Total importado em `public/legacy-sp/`: **796 arquivos / 26,56 MB** (maior arquivo: `9f78be8c7219-gif-super-desconto_wph99i.webp` com `1,68 MB`), bem abaixo dos limites do Workers.

---

## 6. Roadmap de Reorganização (Fases 3 e 4)

### Fase 3A — Reorganização Semântica de URLs, Redirects 301 e SEO Técnico (Concluída em 25/11/2026)

As 26 rotas originais (nativas + importadas do SwipePages) foram consolidadas em uma árvore semântica em `pt-BR` com canonicals únicos, JSON-LD (`EducationalOrganization`, `WebSite`, `Course`, `SoftwareApplication`, `Product`, `CollectionPage`, `BreadcrumbList`, `FAQPage`), `<Breadcrumbs />` acessíveis e **48 regras `301`** em `public/_redirects` (cobrindo formas com e sem `/` final e preservando query strings/UTMs automaticamente):

| Rota(s) Antiga(s)                                                    | Nova URL Canônica (`www.ntrmoto.com.br`)                                              |
| :------------------------------------------------------------------- | :------------------------------------------------------------------------------------ |
| `/clube/`, `/bf26/`, `/bf26-inscricoes/`, `/combo-black/`            | `/cursos/clube-de-preparadores/`                                                      |
| `/pro/`                                                              | `/cursos/formacao-pro/`                                                               |
| `/curso-cabecote-v02/`, `/expert-cabecotes-v2/`                      | `/cursos/preparacao-de-cabecotes/`                                                    |
| `/combo-comandos-4em1pro/`                                           | `/cursos/comandos-de-valvulas/`                                                       |
| `/crp-pv11/`, `/curso-preparacao/`                                   | `/cursos/curso-rapido-preparacao/`                                                    |
| `/ctx/`, `/ctx/pt/`, `/ctx-pv5/`, `/ctx-pv6/`                        | `/cursos/taxa-de-compressao/`                                                         |
| `/ctx/es/`                                                           | `/es/cursos/tasa-de-compresion/` _(mantida `noindex` até ativação de checkout LATAM)_ |
| `/calculadora-pv1/`, `/calculadora-pv2/`, `/calculadora-de-motores/` | `/ferramentas/calculadora-de-motores/`                                                |
| `/r4t-v01/`, `/r4t-v02/`                                             | `/projetos/rei-do-4trinho/`                                                           |
| `/gmp/`, `/gmp-lp11/`, `/pdf_conteudos/`                             | `/projetos/guia-motores-preparados/`                                                  |
| `/aula-cambio/`, `/aulas/`                                           | `/aulas/cambio-e-velocidade-final/`                                                   |
| _(Novos hubs)_                                                       | `/cursos/`, `/ferramentas/`, `/projetos/`                                             |

- **Rotas protegidas preservadas intactas (`noindex, nofollow, noarchive, nosnippet`, fora do `sitemap-0.xml`):** `/embed-calculadora/`, `/embededcalc1/`, `/embededcalc2/`, `/convite/`, `/calculadora-up/`, `/404`, `/500`.
- **`robots.txt` ajustado:** remove `/embed*` do `Disallow` (mantendo apenas `/404` e `/500`) para permitir que crawlers leiam `X-Robots-Tag: noindex` e removam embeds do índice.
- **Refatoração visual completa do Bloco B (SwipePages HTML → Astro/Tailwind nativo + substituição de formulários SwipePages):** segue planejada como etapa seguinte, mantendo `src/legacy-swipepages/*.html` intactos enquanto servem as novas URLs via `enhanceLegacyHtml`.

### Fase 3A.1 — Padronização Cloudflare Zaraz + LGPD CMP (`CookieBanner`) (Concluída em 25/11/2026)

- **Remoção de tracking duplicado (GTM/Stape legado):** removido `stape.escolademotores.com.br/4txurzhmh.js` (`GTM-WPK87RPH`) de [src/layouts/BaseLayout.astro](file:///Users/mequelussi/Desenvolvimento/ntrmoto/paginas-ntrmoto/src/layouts/BaseLayout.astro) (e `PUBLIC_GTM_ID` de `astro.config.mjs`), além de `stape.escolademotores.com.br/4txurzhmh.js` / `googletagmanager.com/gtm.js` (`GTM-W4DNLLD`) em tempo de build nos wrappers legados via `stripLegacyGtm()` em [src/utils/legacy-seo.ts](file:///Users/mequelussi/Desenvolvimento/ntrmoto/paginas-ntrmoto/src/utils/legacy-seo.ts), operando agora 100% em **Zaraz puro na borda** (`G-QFTMGBKH7L` + Meta CAPI `2193722040898889`).
- **Paridade completa com `blog.ntrmoto.com.br`:** criados [src/utils/tracking.ts](file:///Users/mequelussi/Desenvolvimento/ntrmoto/paginas-ntrmoto/src/utils/tracking.ts), [src/utils/zaraz-runtime.ts](file:///Users/mequelussi/Desenvolvimento/ntrmoto/paginas-ntrmoto/src/utils/zaraz-runtime.ts), [src/components/CookieBanner.astro](file:///Users/mequelussi/Desenvolvimento/ntrmoto/paginas-ntrmoto/src/components/CookieBanner.astro) e [src/components/ZarazTracking.astro](file:///Users/mequelussi/Desenvolvimento/ntrmoto/paginas-ntrmoto/src/components/ZarazTracking.astro) para gerar/compartilhar `_ntr_id`, `_ntr_attr`, `_ntr_cookie_bar=1` e `cf_consent` em `Domain=.ntrmoto.com.br`, sincronizar Google Consent Mode v2 (`google_consent_default` / `google_consent_update`), exibir o banner discreto `#ntr-cb` + botão `"Preferências de cookies"` (`data-cookie-preferences`), decorar links para `escolademotores.com.br` e disparar `view_content`, `cta_click` (`InitiateCheckout` em Eduzz/Greenn e `Lead` em WhatsApp/LPs externas) e `scroll_depth` (50%/90%).
- **Proteção dos embeds Cademi:** `/embed-calculadora/`, `/embededcalc1/` e `/embededcalc2/` não recebem UI `#ntr-cb` nem barra de rodapé, e o banner valida `window.self === window.top`.

### Fase 3B — Atualização Interna do Ecossistema `ntrmoto.com.br`

1. Atualizar [src/components/home/Courses.astro](file:///Users/mequelussi/Desenvolvimento/ntrmoto/paginas-ntrmoto/src/components/home/Courses.astro) na Home para que os cards da Calculadora (`/calculadora-pv2/`) e Taxa de Compressão (`/ctx-pv5/` ou `/ctx/`) apontem internamente para `www.ntrmoto.com.br`.
2. Atualizar `blog-ntrmoto/seed/brand-proof.md` e os links de CTA dos 30 artigos em `https://blog.ntrmoto.com.br` para apontarem para `https://www.ntrmoto.com.br/<slug>/` com os parâmetros `?utm_source=blog_ntr&utm_medium=seo&utm_campaign=<slug-do-artigo>` (mantendo o leitor no mesmo domínio raiz `ntrmoto.com.br` e preservando o cookie Zaraz `_ntr_id`).

### Fase 4 — Virada dos Anúncios e Redirects 301

1. Atualizar gradualmente os links de destino nas campanhas de Meta Ads / Google Ads de `lp.escolademotores.com.br/...` e `www.escolademotores.com.br/...` para `https://www.ntrmoto.com.br/...`.
2. Validar tracking, eventos de conversão (GTM/Stape/Zaraz/Meta Pixel) e checkouts Eduzz em produção.
3. Após 100% do tráfego virado (e após checar a Calculadora dentro da Cademi), configurar **Redirect Rules 301 rota a rota** em `lp.escolademotores.com.br/*` e `www.escolademotores.com.br/*` → `https://www.ntrmoto.com.br/$1` **preservando todas as query strings** (`utm_*`, `fbclid`, `gclid`).
4. Somente após período seguro de monitoramento dos redirecionamentos, desativar o projeto Pages `ntr-lp` e a assinatura do SwipePages.
