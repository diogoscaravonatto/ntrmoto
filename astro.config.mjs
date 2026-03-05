// @ts-check
import { defineConfig } from 'astro/config'; // Importa a função helper para definir a configuração com suporte a Typescript
import cloudflare from '@astrojs/cloudflare'; // Adaptador para deploy e execução na infraestrutura da Cloudflare
import tailwindcss from '@tailwindcss/vite'; // Plugin Vite para suporte ao Tailwind CSS v4
import sitemap from '@astrojs/sitemap'; // Integração para gerar automaticamente o arquivo sitemap.xml

import partytown from '@astrojs/partytown'; // Integração para mover scripts de terceiros pesados para Web Workers

import compress from 'astro-compress'; // Integração para comprimir assets (HTML, JS, CSS) no build final

import robotsTxt from 'astro-robots-txt'; // Integração para gerar automaticamente o arquivo robots.txt

// https://astro.build/config
export default defineConfig({
  output: 'server', // Define o modo de saída como SSR (Server-Side Rendering) para processamento dinâmico
  build: {
    inlineStylesheets: 'always', // Injeta o CSS diretamente no HTML para zerar o Render Blocking
  },
  site: 'https://www.vetpragas.com.br', // URL base do site, usada para gerar sitemaps e links absolutos

  // Adaptador Cloudflare para deploy na infraestrutura Cloudflare Workers
  adapter: cloudflare({
    imageService: 'compile', // Habilita a compilação local de imagens para rotas prerenderizadas (Sharp no tempo de build)
  }),

  integrations: [ // Lista de todas as integrações/plugins ativos no projeto
    sitemap(), // Gera automaticamente o sitemap.xml
    partytown({ // Configuração do Partytown para scripts de terceiros
      config: {
        forward: ['dataLayer.push'], // Encaminha eventos do Google Tag Manager para o Web Worker

        // Otimizações de performance
        debug: false, // Desativa logs de debug por performance
        logCalls: false, // Não loga chamadas de função no worker
        logGetters: false, // Não loga acessos a propriedades (getters)
        logSetters: false, // Não loga definições de propriedades (setters)
        logImageRequests: false, // Não loga requisições de imagem feitas pelo worker
        logMainAccess: false, // Não loga acessos ao thread principal
        logScriptExecution: false, // Não loga a execução de scripts no worker
        logSendBeaconRequests: false, // Não loga requisições beacon
        logStackTraces: false, // Não gera stack traces detalhadas por performance
      },
    }),

    compress({ // Configurações de compressão de assets
      CSS: true, // Habilita compressão de CSS
      HTML: true, // Habilita compressão de HTML
      Image: false, // Sharp já otimiza, evitar compressão dupla que pode degradar qualidade
      JavaScript: true, // Habilita compressão de JavaScript
      SVG: true, // Habilita compressão de arquivos SVG
    }),

    robotsTxt({ // Configuração do gerador de robots.txt para SEO
      policy: [ // Define as regras de acesso para robôs de busca
        {
          userAgent: "*", // Aplica a regra para todos os robôs (Google, Bing, etc)
          allow: "/", // Permite o rastreamento da raiz do site
          disallow: ["/404", "/500"], // Proíbe o rastreamento de páginas de erro
        },
      ],
    }),
  ],

  image: { // Configuração global do serviço de imagens do Astro
    remotePatterns: [ // Lista branca de domínios externos permitidos para otimização de imagem
      {
        protocol: 'https', // Protocolo seguro obrigatório
        hostname: 'images.unsplash.com', // Permite imagens do Unsplash
      },
    ],
  },

  devToolbar: { // Configuração da barra de ferramentas lateral do Astro em desenvolvimento
    enabled: true // Mantém a barra ativada para facilitar o debug de ilhas e performance
  },

  vite: { // Configurações específicas para o motor de build Vite
    plugins: [tailwindcss()], // Injeta o plugin do Tailwind CSS no fluxo do Vite
  },
});