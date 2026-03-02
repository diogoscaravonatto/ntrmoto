# 🚀 VetPragas - Site Profissional

Bem-vindo ao **Sniper Pages**, o boilerplate definitivo para desenvolvedores que buscam o equilíbrio perfeito entre **Vibe Coding** (desenvolvimento assistido por IA) e **Design de Alta Performance**. 

Este não é apenas um repositório de código; é um ecossistema pronto para produção, otimizado para a próxima geração da web com **Astro v6**, **Tailwind CSS v4** e deploy nativo no **Cloudflare Workers**.

---

## 💎 O Coração do Projeto: Discovery Center

O Sniper Pages possui um **Discovery Center** integrado (disponível em `/templates`), que funciona como um hub de exploração dinâmica para todos os recursos do projeto:

- **Template Explorer:** Navegue por 18+ landing pages completas.
- **Component Lab:** Visualize e teste componentes modulares isoladamente.
- **Funnel Preview:** Explore fluxos de vendas multi-etapas inspirados nos maiores players de marketing digital.

---

## 📦 Stack Tecnológica (The "Bleeding Edge")

- **Astro v6 (Beta):** O framework web mais rápido, agora com Content Layer API e Server Islands.
- **Vue 3.5:** Reatividade de alta performance para ilhas de interatividade complexas.
- **Tailwind CSS v4 (Oxide):** Nova engine ultra-rápida baseada em Rust.
- **Motion (framer-motion p/ JS):** Animações fluidas de 60fps para uma experiência premium.
- **Cloudflare Workers:** Infraestrutura global com SSR nativo e suporte a `workerd`.
- **TypeScript:** Segurança total de tipos de ponta a ponta.

---

## 🎨 Galeria de Design Systems & Nichos

Nossa biblioteca inclui templates esculpidos para conversão, cada um com sua própria identidade visual:

| Nicho | Estilo Visual | Público Alvo |
| :--- | :--- | :--- |
| **Advocacia** | Premium Black & Gold | Escritórios de luxo |
| **Arquitetura** | Luxury Editorial | Arquitetos e Designers |
| **Marketing Digital** | VSL / High Conversion | Infoprodutores |
| **E-book** | Golden Era / Clean | Venda de ativos digitais |
| **Psicologia** | Organic & Soft | Terapeutas e Clínicas |
| **Pocket Store** | Ultra Minimalist | E-commerce de produto único |
| **VetPragas** | Clean Health & Safety | Controle de pragas profissional |

---

## 🏗️ Estrutura de Pastas (Atomic Colocation)

Adotamos a estratégia de **Colocation**, onde os arquivos vivem perto de onde são usados. Isso torna o projeto extremamente amigável para IAs (como Cursor/Claude) entenderem o contexto.

```text
src/
├── components/              # Componentes Globais
│   ├── sections/            # 12 seções componentizadas da homepage
│   │   ├── HeroDisruptivo.astro
│   │   ├── ShowcaseTemplates.astro
│   │   ├── CustoZero.astro
│   │   ├── CasosDeUso.astro
│   │   ├── TutorialPassos.astro
│   │   ├── ProvaSocial.astro
│   │   ├── PerformanceVisual.astro
│   │   ├── TechExplicado.astro
│   │   ├── ComparativoFinanceiro.astro
│   │   ├── FAQHumanos.astro
│   │   ├── FinalCTA.astro
│   │   └── FooterSimples.astro
│   └── shared/              # Componentes reutilizáveis entre templates
│       ├── WhatsAppFloat.astro
│       ├── FAQAccordion.astro
│       ├── PricingTable.astro
│       ├── SocialProofBar.astro
│       ├── CountdownTimer.astro
│       └── Testimonials.astro
├── layouts/                 # BaseLayout (SEO, Meta, Analytics)
├── pages/                   # Rotas principais e Hub de Templates
│   └── templates/           # Discovery Center (preview, componentes, funis)
├── templates/               # O coração do Design System
│   ├── funnels/             # Fluxos de Vendas (VSL, Checkout, Upsell)
│   └── pages/               # 20+ Landing Pages de nicho
├── stores/                  # Estado global (Nanostores)
├── styles/                  # Configurações globais do Tailwind v4
├── utils/                   # Helpers e metadata
└── content.config.ts        # Schema das Content Collections
```

---

## 🛠️ Guia do Desenvolvedor

### 🚀 Começando Agora

```bash
# 1. Instale as dependências
npm install

# 2. Inicie o ambiente de desenvolvimento
npm run dev

# 3. Acesse o Hub de Templates
# URL: http://localhost:4321/templates
```

### 📋 Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run dev:clean` | Limpa cache + inicia dev server (resolve erro 504 do Vite) |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build local |
| `npm run check` | Verifica tipos TypeScript/Astro |
| `npm run clean` | Limpa cache do Vite, dist e tipos Astro |
| `npm run deploy` | Build + deploy no Cloudflare Workers |

### 🧩 Como Criar um Novo Componente

**Componentes reutilizáveis** (botões, FAQs, CTAs, etc.):
1. Crie seu arquivo `.astro` em `src/components/shared/`.
2. Importe usando o alias: `import MeuComponente from "@shared/MeuComponente.astro";`

**Componentes de seção** (blocos da homepage):
1. Crie seu arquivo `.astro` em `src/components/sections/`.
2. Importe no `index.astro`: `import MinhaSecao from "@components/sections/MinhaSecao.astro";`

**Componentes do Discovery Center** (33 componentes completos de template):
1. Crie seu arquivo `.astro` em `src/pages/templates/components/`.
2. O sistema de glob import irá detectá-lo automaticamente.

### 🏷️ Aliases de Importação

| Alias | Caminho |
| :--- | :--- |
| `@/*` | `src/*` |
| `@components/*` | `src/components/*` |
| `@shared/*` | `src/components/shared/*` |
| `@templates/*` | `src/templates/*` |
| `@templates-pages/*` | `src/templates/pages/*` |
| `@layouts/*` | `src/layouts/*` |
| `@assets/*` | `src/assets/*` |

### 📈 Funis de Vendas
O projeto introduziu suporte a funis multi-etapas. Localizados em `src/templates/funnels/`, eles permitem simular toda a jornada do cliente:
`Landing Page` ➔ `Checkout` ➔ `Upsell` ➔ `Downsell` ➔ `Obrigado`.

### 📊 Google Tag Manager (Otimizado)

O projeto inclui suporte nativo ao **Google Tag Manager** usando **Partytown**, que executa o GTM em um **Web Worker** para preservar o desempenho da thread principal.

**Como configurar:**

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Adicione seu GTM ID no arquivo `.env`:
```bash
PUBLIC_GTM_ID=GTM-XXXXXXX
```

3. O GTM será carregado automaticamente em todas as páginas que usam o `BaseLayout`.

**Benefícios:**
- ✅ **Zero impacto no desempenho** - Scripts executam em Web Worker
- ✅ **Suporte a dataLayer.push** - Eventos customizados funcionam normalmente
- ✅ **Configuração opcional** - Não afeta o projeto se não configurado
- ✅ **Proxy CORS automático** - Scripts de terceiros (Facebook Pixel, GA4) funcionam sem erros

**Deploy no Cloudflare:**
A variável `PUBLIC_GTM_ID` está configurada em `wrangler.json` como uma **var** pública, permitindo que o GTM funcione corretamente no Cloudflare Workers.

---

## 🚀 Deploy no Cloudflare Workers

Este projeto está configurado para deploy no **Cloudflare Workers** (modo SSR), oferecendo:
- ✅ **SSR Global** com latência ultra-baixa
- ✅ **Custom Domain** configurado via `wrangler.json`
- ✅ **Assets otimizados** automaticamente
- ✅ **Compressão de imagens** (até 86% de redução)

### Deploy Rápido

```bash
# Build + Deploy em um único comando
npm run deploy
```

### Configuração Manual

Se preferir executar os passos separadamente:

```bash
# 1. Build do projeto
npm run build

# 2. Deploy via Wrangler
npx wrangler deploy
```

### Configuração do Wrangler

O arquivo `wrangler.json` na raiz do projeto contém as configurações de deploy:

```json
{
  "name": "sniper-pages-worker",
  "main": "@astrojs/cloudflare/entrypoints/server",
  "compatibility_date": "2026-01-28",
  "compatibility_flags": ["nodejs_compat", "nodejs_compat_populate_process_env"],
  "assets": {
    "binding": "CF_ASSETS",
    "directory": "./dist/client"
  },
  "observability": {
    "enabled": true
  },
  "route": {
    "pattern": "pages.sniper.escoladeaplicativos.com.br",
    "zone_name": "escoladeaplicativos.com.br",
    "custom_domain": true
  }
}
```

**Personalize:**
- `name`: Nome do seu worker
- `route.pattern`: Seu domínio customizado
- `route.zone_name`: Zona DNS no Cloudflare

---

## 💡 Princípios de "Vibe Coding" neste Kit

1. **Contexto Claro:** Componentes pequenos e bem definidos.
2. **Metadata-Rich:** Usamos objetos de metadados para que a IA saiba como estilizar ícones e cores de cada nicho.
3. **Tailwind v4 First:** Estilização direta no HTML para evitar "CSS Hell" e facilitar refatorações via IA.

---

## 📄 Notas de Versão

- **v1.5.0:** Homepage componentizada em 12 seções reutilizáveis, pasta `shared/` com 6 componentes-base, scripts `clean`/`dev:clean`, alias `@shared/`, remoção de CSS duplicado e scrollbar otimizada para light/dark mode.
- **v1.4.0:** Deploy configurado para Cloudflare Workers, otimização de imagens VetPragas, script `npm run deploy`.
- **v1.3.0:** Adição do Discovery Center (Vue 3.5), suporte a Funis de Vendas e migração para Tailwind v4.
- **Status:** ✨ Estável e pronto para escala.

---

**Sniper Pages** - Transformando ideias em interfaces de alta conversão.  
*Desenvolvido com ❤️ e IA.*
#   v e t p r a g a s - s i t e  
 #   v e t p r a g a s - s i t e  
 