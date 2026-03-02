# 🔍 Análise de Padronização dos Templates — Sniper Pages

## Resumo Executivo

O projeto possui **30 templates de página** em `src/pages/templates/pages/` e **1 funnel** em `src/pages/templates/funnels/`. A análise revelou **3 padrões arquiteturais distintos** coexistindo, o que gera inconsistência, dificulta manutenção e prejudica a experiência de desenvolvimento.

---

## 📊 Classificação dos Templates

### 🟢 Padrão A — Componentizado + `data.json` (IDEAL)
> Template PAGE apenas orquestra componentes. Dados vivem em JSON. Componentes vivem em `src/templates/pages/<nicho>/components/`.

| Template | Linhas | Componentes | `data.json` |
|----------|--------|-------------|-------------|
| `advocacia.astro` | 90 | 5 | ✅ |
| `agencia.astro` | ~44 | ~5 | ✅ |
| `aplicativo-movel.astro` | ~70 | ~5 | ✅ |
| `barbearia.astro` | ~60 | 7 | ✅ |
| `contabilidade.astro` | 76 | 11 | ✅ (parcial*) |
| `ebook.astro` | ~60 | ~5 | ✅ |
| `eventos.astro` | 44 | 5 | ✅ |
| `imobiliaria.astro` | ~60 | ~6 | ✅ |
| `link-in-bio.astro` | ~44 | ~7 | ✅ |
| `odontologia.astro` | ~70 | ~10 | ✅ |
| `personal-trainer.astro` | ~50 | ~5 | ✅ |
| `pet.astro` | ~60 | ~7 | ✅ |
| `pocket-store.astro` | 44 | 5 | ✅ |
| `psicologia.astro` | ~50 | ~5 | ✅ |
| `restaurante.astro` | ~50 | ~5 | ✅ |
| `webinar.astro` | ~50 | ~3 | ✅ |

> *`contabilidade.astro` define dados inline no frontmatter em vez de importar do `data.json`.

### 🟡 Padrão B — Componentizado + `content.ts` (VARIAÇÃO)
> Mesma ideia do Padrão A, mas usa TypeScript ao invés de JSON para os dados.

| Template | Linhas | Componentes | Dados |
|----------|--------|-------------|-------|
| `vetpragas.astro` | ~75 | 17 | `content.ts` |
| `vetpragas2.astro` | ~75 | 17 | `content.ts` |
| `inteligencia.astro` | ~70 | ~9 | ✅ `data.json` |
| `arquitetura.astro` | ~200 | ~6 | ✅ `data.json` |

### 🔴 Padrão C — MONOLÍTICO (PROBLEMÁTICO)
> Todo o HTML, CSS, dados e lógica vivem em um único arquivo `.astro`. Sem componentização. Sem separação de dados.

| Template | Linhas | Problema Principal |
|----------|--------|--------------------|
| `cybersecurity.astro` | **554** | Tudo inline, zero componentes |
| `energia-solar.astro` | **641** | Tudo inline, zero componentes |
| `estetica.astro` | **~600** | Tudo inline, zero componentes |
| `financeira.astro` | **~540** | Tudo inline, zero componentes |
| `gastronomia.astro` | **~490** | Tudo inline, zero componentes |
| `imoveis-luxo.astro` | **~470** | Tudo inline, zero componentes |
| `joalheria.astro` | **~490** | Tudo inline, zero componentes |
| `mentoria.astro` | **~420** | Tudo inline, zero componentes |
| `saas.astro` | **679** | Tudo inline, zero componentes |
| `spa.astro` | **~550** | Tudo inline, zero componentes |

---

## 🚨 Problemas Identificados

### 1. Inconsistência de Padrão de Dados
- **18 templates** usam `data.json` (JSON estático)
- **2 templates** usam `content.ts` (TypeScript)
- **10 templates** NÃO possuem dados separados (tudo inline)
- **1 template (contabilidade)** tem `data.json` mas define dados no frontmatter

**Impacto:** Não existe um contrato único de dados. Novos templates não têm referência clara de como estruturar.

### 2. Templates Monolíticos (10 de 30 = 33%)
Arquivos com 420-679 linhas contendo Nav, Hero, Sections, Footer, dados e estilos tudo em um único `.astro`.

**Impacto:**
- Impossível reutilizar seções individuais
- Difícil manutenção (achar e editar uma section específica)
- Performance: Astro não consegue otimizar tree-shaking por seção
- Inconsistência visual entre templates do mesmo starter kit

### 3. Templates Monolíticos Sem Pasta em `src/templates/pages/`
Os 10 templates monolíticos **não possuem pasta correspondente** em `src/templates/pages/`. Toda a estrutura vive apenas no arquivo de página.

### 4. Fontes Duplicadas e Inconsistentes
- `BaseLayout` carrega Inter + Montserrat + Playfair Display por padrão
- Templates individuais importam fontes adicionais via `@import url()` nos `<style>`:
  - `advocacia.astro`: Cinzel + Montserrat
  - `eventos.astro`: Inter + JetBrains Mono
  - `pocket-store.astro`: Inter
  - `contabilidade.astro`: Manrope
  - Templates monolíticos: Não declaram fontes (herdando do layout ou falhando silenciosamente)

**Impacto:** Duplicação de requests HTTP, possível FOUT, e inconsistência no uso de fontes.

### 5. Estilos Globais vs Scoped
- Muitos templates usam `:global()` para aplicar fontes, o que pode vazar para outros templates
- Alguns definem classes custom (`.text-gold-500`) que são estilos locais não reaproveitáveis
- O `BaseLayout` tem estilos globais que podem conflitar com templates específicos

### 6. Schema de `data.json` Inconsistente
Comparando `data.json` entre templates:

```
advocacia/data.json   → { id, name, description, theme, firm: {...} }
contabilidade/data.json → { id, name, description, theme, image, colors: {...}, hero: {...} }
barbearia/data.json   → { id, name, description, theme, image, colors: {...}, hero: {...} }
link-in-bio/data.json → { id, name, description, theme, avatar, title, links: [...] }
```

- Nem todos tem `colors`
- Nem todos tem `image`
- Estrutura do `hero` varia
- Alguns têm campos específicos do nicho sem padrão

### 7. Cores Inline no Page vs Cores do data.json
Alguns templates (advocacia, eventos) definem `layoutColors` diretamente no frontmatter. Outros (contabilidade) definem no frontmatter mas TAMBÉM têm no `data.json`. Os monolíticos não separaram nada.

---

## ✅ Padrão Proposto (Convenção Definitiva)

### Estrutura de Diretórios

```
src/
├── templates/
│   └── pages/
│       └── <nicho>/              # Ex: cybersecurity, saas, advocacia
│           ├── data.ts           # Dados tipados (TypeScript > JSON)
│           └── components/
│               ├── Hero.astro
│               ├── Navbar.astro
│               ├── Features.astro
│               ├── Pricing.astro
│               ├── FAQ.astro
│               ├── CTA.astro
│               └── Footer.astro
│
├── pages/
│   └── templates/
│       └── pages/
│           └── <nicho>.astro     # Apenas orquestração (~40-80 linhas)
```

### Regras do Padrão

#### 1. **Arquivo de Página (orquestrador)**
- Máximo ~80 linhas
- Apenas importa `BaseLayout`, componentes e dados
- NÃO contém HTML de seções (nenhum `<section>` inline)
- NÃO contém dados inline (arrays, objetos)
- Define apenas `layoutColors` e passa para `BaseLayout`

```astro
---
export const prerender = true;
import BaseLayout from "@layouts/BaseLayout.astro";
import { templateData } from "@templates-pages/cybersecurity/data";
import Navbar from "@templates-pages/cybersecurity/components/Navbar.astro";
import Hero from "@templates-pages/cybersecurity/components/Hero.astro";
import Threats from "@templates-pages/cybersecurity/components/Threats.astro";
import SOC from "@templates-pages/cybersecurity/components/SOC.astro";
import Impact from "@templates-pages/cybersecurity/components/Impact.astro";
import FAQ from "@templates-pages/cybersecurity/components/FAQ.astro";
import Solutions from "@templates-pages/cybersecurity/components/Solutions.astro";
import CTA from "@templates-pages/cybersecurity/components/CTA.astro";
import Footer from "@templates-pages/cybersecurity/components/Footer.astro";
---

<BaseLayout
    title={templateData.meta.title}
    description={templateData.meta.description}
    image={templateData.meta.image}
    theme={templateData.theme}
    colors={templateData.colors}
    disableDefaultFonts
>
    <main class={templateData.rootClass}>
        <Navbar />
        <Hero />
        <Threats />
        <SOC />
        <Impact />
        <FAQ />
        <Solutions />
        <CTA />
        <Footer />
    </main>
</BaseLayout>

<style>
    /* Apenas fontes custom do template, se necessário */
</style>
```

#### 2. **Arquivo de Dados (`data.ts`)**
- TypeScript com tipagem forte
- Exporta um objeto com schema padronizado
- Contém TODOS os textos, cores, imagens e dados do template

```typescript
// Schema mínimo obrigatório para todo template
export const templateData = {
    // Metadados obrigatórios
    meta: {
        id: "cybersecurity",
        title: "Cyber Fortress | Proteção de Dados de Nível Militar",
        description: "...",
        image: "/images/templates/cybersecurity.png",
    },

    // Tema e cores obrigatórios
    theme: "dark" as const,
    colors: {
        primary: "#dc2626",
        secondary: "#991b1b",
        background: "#000000",
    },

    // Classe root (wrapper do <main>)
    rootClass: "bg-black text-zinc-300 font-mono selection:bg-red-600 selection:text-white",

    // Fontes custom do template (se diferente do padrão do BaseLayout)
    fonts: {
        heading: "font-mono",
        body: "font-mono",
        googleFontsUrl: null, // ou URL se precisar carregar fonts extra
    },

    // Dados específicos do nicho (tipados)
    hero: { ... },
    features: [ ... ],
    pricing: [ ... ],
    faq: [ ... ],
    testimonials: [ ... ],
    cta: { ... },
    footer: { ... },
};
```

#### 3. **Componentes (`components/Hero.astro`, etc.)**
- Cada componente = 1 seção visual
- Importa dados do `data.ts` do mesmo template
- CSS scoped (sem `:global()` para evitar vazamento)
- Sem lógica de negócio, apenas apresentação

```astro
---
import { templateData } from "../data";
const { hero } = templateData;
---

<section class="...">
    <h1>{hero.title}</h1>
    <p>{hero.subtitle}</p>
</section>

<style>
    /* Estilos SCOPED deste componente */
</style>
```

---

## 📋 Plano de Refatoração (Priorizado)

### Fase 1 — Refatorar Templates Monolíticos (ALTA PRIORIDADE)
Cada um dos 10 templates monolíticos precisa ser dividido em componentes:

| # | Template | Linhas | Seções Estimadas | Prioridade |
|---|----------|--------|------------------|------------|
| 1 | `saas.astro` | 679 | 8 | 🔴 Alta |
| 2 | `energia-solar.astro` | 641 | 8 | 🔴 Alta |
| 3 | `estetica.astro` | ~600 | 7 | 🔴 Alta |
| 4 | `cybersecurity.astro` | 554 | 8 | 🔴 Alta |
| 5 | `financeira.astro` | ~540 | 7 | 🔴 Alta |
| 6 | `spa.astro` | ~550 | 7 | 🔴 Alta |
| 7 | `gastronomia.astro` | ~490 | 7 | 🟡 Média |
| 8 | `joalheria.astro` | ~490 | 7 | 🟡 Média |
| 9 | `imoveis-luxo.astro` | ~470 | 7 | 🟡 Média |
| 10 | `mentoria.astro` | ~420 | 6 | 🟡 Média |

### Fase 2 — Migrar `data.json` → `data.ts`
- Migrar os 18 templates com `data.json` para `data.ts` com tipagem
- Padronizar o schema mínimo (meta, theme, colors, rootClass)
- Manter retrocompatibilidade com componentes existentes

### Fase 3 — Corrigir Inconsistências nos Templates Componentizados
- `contabilidade.astro`: remover dados inline do frontmatter, usar `data.ts`
- `advocacia.astro`: extrair footer inline para componente `Footer.astro`
- Padronizar como fontes custom são declaradas
- Garantir que nenhum template use `:global()` desnecessariamente

### Fase 4 — Criar Type Definitions
- Criar `src/types/template.ts` com interfaces padronizadas
- `TemplateData`, `TemplateMeta`, `TemplateColors`, `TemplateHero`, etc.
- Todos os `data.ts` devem implementar essas interfaces

---

## 📐 Métricas de Melhoria Esperadas

| Métrica | Antes | Depois |
|---------|-------|--------|
| Templates componentizados | 20/30 (67%) | **30/30 (100%)** |
| Templates com dados tipados | 2/30 (7%) | **30/30 (100%)** |
| Linhas médias por page file | ~200 | **~50** |
| Schema de dados padronizado | ❌ | ✅ |
| Reutilização de seções | Baixa | Alta |
| Facilidade para criar novo template | Ambígua | Clara e padronizada |
