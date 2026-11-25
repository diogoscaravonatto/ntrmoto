// @ts-check
import { defineConfig, fontProviders } from "astro/config"; // Helper de configuração e provedores de fontes nativos
import tailwindcss from "@tailwindcss/vite"; // Plugin Vite para suporte ao Tailwind CSS v4
import sitemap from "@astrojs/sitemap"; // Integração para gerar automaticamente o arquivo sitemap.xml
import robotsTxt from "astro-robots-txt"; // Integração para gerar automaticamente o arquivo robots.txt

// https://astro.build/config
export default defineConfig({
  // Padrão Astro 7 (`output: "static"`): gera Static Assets puros em `./dist` para `cf deploy ./dist`.
  site: process.env.SITE_URL || "https://www.ntrmoto.com.br",

  // Astro Fonts API: baixa e otimiza fontes em build-time (zero requests externos e métricas de fallback automáticas)
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-inter",
      weights: [400, 500, 600, 700, 800, 900],
      styles: ["normal"],
    },
    {
      provider: fontProviders.google(),
      name: "Space Grotesk",
      cssVariable: "--font-space-grotesk",
      weights: [400, 500, 600, 700],
      styles: ["normal"],
    },
    {
      provider: fontProviders.google(),
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains-mono",
      weights: [400, 500, 600, 700, 800],
      styles: ["normal"],
      fallbacks: ["ui-monospace", "monospace"],
    },
  ],

  // Porta do dev/preview: respeita a env `PORT` quando presente.
  server: {
    port: Number(process.env.PORT) || 4321,
  },

  // Sessão desligada: projeto de landing pages / funis / calculadoras sem estado de servidor.
  session: false,

  // Configurações de segurança
  security: {
    actionBodySizeLimit: 1048576, // 1MB
  },

  // Prefetch conservador em hover para navegação rápida entre LPs
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },

  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes("/embed") &&
        !page.includes("/404") &&
        !page.includes("/500") &&
        !page.includes("/es/") &&
        !["/convite/", "/calculadora-up/"].some((excluded) => page.endsWith(excluded)),
    }),

    robotsTxt({
      policy: [
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/404", "/500"],
        },
      ],
    }),
  ],

  image: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
    // Build-time: Sharp
    service: {
      entrypoint: "astro/assets/services/sharp",
      config: {
        jpeg: { mozjpeg: true, quality: 80 },
        webp: { effort: 5, quality: 80 },
        avif: { effort: 4, quality: 70 },
        png: { compressionLevel: 9 },
      },
    },
  },

  devToolbar: {
    enabled: true,
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
