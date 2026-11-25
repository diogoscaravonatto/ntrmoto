// @ts-check
import { defineConfig } from 'astro/config'; // Importa a função helper para definir a configuração com suporte a Typescript
import cloudflare from '@astrojs/cloudflare'; // Adaptador para deploy e execução na infraestrutura da Cloudflare
import tailwindcss from '@tailwindcss/vite'; // Plugin Vite para suporte ao Tailwind CSS v4
import sitemap from '@astrojs/sitemap'; // Integração para gerar automaticamente o arquivo sitemap.xml

import compress from 'astro-compress'; // Integração para comprimir assets (HTML, JS, CSS) no build final

import robotsTxt from 'astro-robots-txt'; // Integração para gerar automaticamente o arquivo robots.txt

// https://astro.build/config
export default defineConfig({
  output: 'static', // Define o modo de saída como Estático para máxima performance e facilidade de deploy em LPs
  build: {
    inlineStylesheets: 'always', // Injeta o CSS diretamente no HTML para zerar o Render Blocking
  },
  site: 'https://lp.escolademotores.com.br', // URL base do subdomínio de LPs da NTR

  // Adaptador Cloudflare para deploy na infraestrutura Cloudflare Workers
  /*
  adapter: cloudflare({
    imageService: process.env.NODE_ENV === 'production' ? 'compile' : 'passthrough',
    generateWranglerConfig: false,
  }),
  */

  integrations: [ // Lista de todas as integrações/plugins ativos no projeto
    sitemap(), // Gera automaticamente o sitemap.xml

    compress({ // Configurações de compressão de assets
      CSS: true, // Habilita compressão de CSS
      HTML: false, // Desabilitado para não alterar/minificar o código oficial do Meta Pixel no HTML
      Image: false, // Sharp já otimiza, evitar compressão dupla que pode degradar qualidade
      JavaScript: false, // Desabilitado para manter o script do Meta Pixel intacto
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
    service: {
      entrypoint: 'astro/assets/services/sharp' // Força o uso do Sharp para processamento local
    },
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