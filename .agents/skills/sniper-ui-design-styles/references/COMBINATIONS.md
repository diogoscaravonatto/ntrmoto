# Guia de Combinações de Estilos

Este documento explica como combinar diferentes estilos visuais de forma efetiva para criar interfaces únicas e coesas.

---

## PRINCÍPIOS DE COMBINAÇÃO

### Regra dos 70-20-10

```
70% - Estilo Base (estrutura, layout, cores principais)
20% - Estilo Secundário (elementos de destaque, features)
10% - Estilo Accent (CTAs, detalhes especiais)
```

**Exemplo**:
- 70% Minimalismo (estrutura limpa, espaço)
- 20% Glassmorphism (cards de features)
- 10% Neo-Brutalism (botões CTA)

---

### Compatibilidade de Estilos

**Alta Compatibilidade** (combinam bem):
- Minimalismo + qualquer morfismo
- Dark Mode + Aurora UI
- Dark Mode + Glassmorphism
- Flat Design + Scroll Animations
- Bento UI + Dark Mode
- Line Art + Minimalismo
- Editorial + Oversized Typography

**Média Compatibilidade** (requer cuidado):
- Brutalism + Neon
- Neumorphism + Gradientes
- Organic + Glassmorphism

**Baixa Compatibilidade** (evitar):
- Brutalism + Glassmorphism
- Skeuomorphism + Flat Design
- Anti-Design + Minimalismo
- Neumorphism + Brutalism
- Multiple morfismos juntos

---

## RECEITAS DE COMBINAÇÃO

### 1. Tech Premium Dark

**Componentes**:
```
Base: Dark Mode (#09090b background)
+ Aurora UI (gradient blurs no hero)
+ Glassmorphism (cards)
+ Bento UI (feature grid)
+ Scroll Animations (reveal)
```

**CSS Variables**:
```css
:root {
  --bg-primary: #09090b;
  --bg-secondary: #18181b;
  --bg-glass: rgba(255, 255, 255, 0.05);
  --border-glass: rgba(255, 255, 255, 0.1);
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --accent-gradient: linear-gradient(135deg, #3b82f6, #8b5cf6);
}
```

**Uso Ideal**: SaaS, Dev Tools, AI Products

**Exemplos**: Linear, Vercel, Supabase

---

### 2. Startup Friendly

**Componentes**:
```
Base: Minimalismo (muito espaço branco)
+ Soft Gradients (backgrounds sutis)
+ Hand-drawn Illustrations (personagens)
+ Neo-Brutalism (CTAs apenas)
+ Microinteractions (hovers)
```

**CSS Variables**:
```css
:root {
  --bg-primary: #ffffff;
  --bg-gradient: linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%);
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --accent: #3b82f6;
  --cta-bg: #fbbf24;
  --cta-shadow: 4px 4px 0 #000;
}
```

**Uso Ideal**: Startups early-stage, Apps B2C, EdTech

---

### 3. Corporate Moderno

**Componentes**:
```
Base: Flat Design (cores sólidas)
+ Line Art (iconografia)
+ Card-based UI (seções)
+ Subtle Animations (profissionalismo)
+ High Contrast (acessibilidade)
```

**CSS Variables**:
```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --accent: #0ea5e9;
  --border: #e2e8f0;
}
```

**Uso Ideal**: B2B, Consultorias, Enterprise

---

### 4. Creative Portfolio

**Componentes**:
```
Base: Asymmetric Grid (layout)
+ Oversized Typography (impacto)
+ Cursor Interactions (engagement)
+ Kinetic Typography (hero)
+ Brutalism (detalhes)
```

**CSS Variables**:
```css
:root {
  --bg-primary: #fafafa;
  --text-primary: #000000;
  --accent: #ff3366;
  --type-display: 'Clash Display', sans-serif;
  --type-body: 'Satoshi', sans-serif;
}
```

**Uso Ideal**: Designers, Agências, Artistas

---

### 5. Wellness & Health

**Componentes**:
```
Base: Organic/Blob (formas fluidas)
+ Pastel Colors (calma)
+ Neumorphism (controles/botões)
+ Soft Gradients (fundos)
+ Gentle Animations (suavidade)
```

**CSS Variables**:
```css
:root {
  --bg-primary: #faf5ff;
  --bg-secondary: #f3e8ff;
  --text-primary: #581c87;
  --text-secondary: #7c3aed;
  --accent: #c084fc;
  --blob-1: #ddd6fe;
  --blob-2: #fbcfe8;
}
```

**Uso Ideal**: Saúde, Meditação, Bem-estar

---

### 6. E-commerce Premium

**Componentes**:
```
Base: Minimalismo Extremo (foco no produto)
+ Editorial Layout (magazine feel)
+ Monochromatic (sofisticação)
+ Full-screen Sections (impacto)
+ Subtle Parallax (profundidade)
```

**CSS Variables**:
```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #fafafa;
  --text-primary: #000000;
  --text-secondary: #737373;
  --accent: #000000;
  --type-display: 'Cormorant Garamond', serif;
  --type-body: 'Inter', sans-serif;
}
```

**Uso Ideal**: Moda, Luxo, Design Products

---

### 7. Fintech Trust

**Componentes**:
```
Base: Minimalismo (clareza)
+ Glassmorphism (cards de dados)
+ Aurora UI (hero background)
+ High Contrast (números)
+ Line Art (ícones)
```

**CSS Variables**:
```css
:root {
  --bg-primary: #0a0a0a;
  --bg-card: rgba(255, 255, 255, 0.05);
  --text-primary: #ffffff;
  --text-secondary: #a3a3a3;
  --accent-green: #22c55e;
  --accent-blue: #3b82f6;
  --glass-border: rgba(255, 255, 255, 0.1);
}
```

**Uso Ideal**: Banking, Crypto, Investment

---

### 8. Gaming & Entertainment

**Componentes**:
```
Base: Dark Mode (imersão)
+ Neon/Glow (energia)
+ 3D Elements (engagement)
+ Cyberpunk Details (atmosfera)
+ Heavy Animations (dinamismo)
```

**CSS Variables**:
```css
:root {
  --bg-primary: #0a0a0a;
  --bg-gradient: linear-gradient(180deg, #0a0a0a 0%, #1a0a2e 100%);
  --neon-cyan: #00ffff;
  --neon-magenta: #ff00ff;
  --neon-lime: #00ff00;
  --text-primary: #ffffff;
  --glow-spread: 20px;
}
```

**Uso Ideal**: Games, Esports, Nightlife

---

### 9. Infoproduto BR (Alta Conversão)

**Componentes**:
```
Base: Single Column (narrativa)
+ High Contrast (legibilidade)
+ Neo-Brutalism (CTAs urgentes)
+ Scroll Animations (engagement)
+ Social Proof Blocks (confiança)
```

**CSS Variables**:
```css
:root {
  --bg-primary: #ffffff;
  --bg-highlight: #fef3c7;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --cta-primary: #dc2626;
  --cta-secondary: #16a34a;
  --urgency: #f59e0b;
  --shadow-brutal: 4px 4px 0 #000;
}
```

**Estrutura**:
```
Headline impactante
↓
VSL / Vídeo
↓
Problema → Solução
↓
Benefícios (bullets)
↓
Social Proof
↓
Oferta + Bônus
↓
Garantia
↓
CTA urgente
↓
FAQ
↓
CTA final
```

---

### 10. SaaS Documentation

**Componentes**:
```
Base: Notion-style (clean)
+ Line Art (ícones)
+ Card-based (code blocks)
+ High Contrast (legibilidade)
+ Subtle Dark Mode option
```

**CSS Variables**:
```css
:root {
  --bg-primary: #ffffff;
  --bg-code: #f4f4f5;
  --text-primary: #18181b;
  --text-secondary: #71717a;
  --text-code: #dc2626;
  --border: #e4e4e7;
  --link: #2563eb;
}

[data-theme="dark"] {
  --bg-primary: #09090b;
  --bg-code: #18181b;
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --border: #27272a;
}
```

**Uso Ideal**: Docs, API Reference, Knowledge Base

---

## ERROS COMUNS DE COMBINAÇÃO

### ❌ Múltiplos Morfismos
```
Glassmorphism + Neumorphism + Claymorphism
= Confusão visual, sem identidade clara
```

### ❌ Contradição de Personalidade
```
Brutalism + Pastel/Soft
= Mensagens conflitantes (agressivo + calmo)
```

### ❌ Overload de Efeitos
```
Parallax + Kinetic Type + 3D + Cursor Effects + Scroll Animations
= Lento, confuso, tira foco do conteúdo
```

### ❌ Misturar Eras
```
Skeuomorphism + Flat Design
= Parece incompleto ou inconsistente
```

---

## CHECKLIST DE COMBINAÇÃO

Antes de finalizar uma combinação, verifique:

- [ ] Há um estilo dominante claro (70%)?
- [ ] Os estilos secundários complementam sem competir?
- [ ] A paleta de cores é coesa?
- [ ] A tipografia funciona com todos os estilos?
- [ ] O resultado comunica a personalidade desejada?
- [ ] A performance não foi comprometida?
- [ ] A acessibilidade foi mantida?
- [ ] Funciona em mobile?

---

## TEMPLATE DE DOCUMENTAÇÃO DE ESTILO

Ao definir a combinação para um projeto, documente:

```markdown
# Design System: [Nome do Projeto]

## Combinação de Estilos
- Base (70%): [Estilo]
- Secundário (20%): [Estilo]
- Accent (10%): [Estilo]

## Cores
- Primary: #
- Secondary: #
- Accent: #
- Background: #
- Text: #

## Tipografia
- Display: [Font]
- Body: [Font]
- Code: [Font]

## Efeitos Permitidos
- [ ] Glassmorphism
- [ ] Sombras
- [ ] Gradientes
- [ ] Animações scroll
- [ ] Hover effects

## Efeitos Proibidos
- [Liste o que NÃO usar]

## Referências Visuais
- [Link 1]
- [Link 2]
```
