// @ts-check
import { defineConfig } from 'astro/config'; // Importa a função helper para definir a configuração com suporte a Typescript
import vue from '@astrojs/vue'; // Integração para suportar componentes Vue.js no projeto
import cloudflare from '@astrojs/cloudflare'; // Adaptador para deploy e execução na infraestrutura da Cloudflare
import tailwindcss from '@tailwindcss/vite'; // Plugin Vite para suporte ao Tailwind CSS v4
import sitemap from '@astrojs/sitemap'; // Integração para gerar automaticamente o arquivo sitemap.xml

import partytown from '@astrojs/partytown'; // Integração para mover scripts de terceiros pesados para Web Workers

import icon from 'astro-icon'; // Integração para gerenciamento e carregamento otimizado de ícones
import compress from 'astro-compress'; // Integração para comprimir assets (HTML, JS, CSS) no build final

import robotsTxt from 'astro-robots-txt'; // Integração para gerar automaticamente o arquivo robots.txt

// https://astro.build/config
export default defineConfig({
  output: 'server', // Define o modo de saída como SSR (Server-Side Rendering) para processamento dinâmico
  site: 'https://vetpragas.com.br', // URL base do site, usada para gerar sitemaps e links absolutos

  // Adaptador Cloudflare apenas em build/preview (miniflare instável em dev no beta atual)
  adapter: process.argv.includes('build') || process.argv.includes('preview') // Verifica se o comando atual é build ou preview
    ? cloudflare({ // Ativa o adaptador Cloudflare se estiver em build/preview
      imageService: 'compile', // Configura o serviço de imagem para compilação estática compatível com Cloudflare
    })
    : undefined, // Em desenvolvimento, não usa adaptador para evitar instabilidades do Miniflare

  integrations: [ // Lista de todas as integrações/plugins ativos no projeto
    // Importante para SEO
    vue({ // Configuração da integração Vue
      devtools: false, // Desativa as ferramentas de desenvolvimento do Vue no cliente para performance
    }),
    sitemap({ // Configuração do gerador de sitemap
      filter: (page) => // Função para filtrar quais páginas devem entrar no sitemap
        !page.includes('/templates/preview/') && // Exclui páginas de preview do sitemap
        !page.includes('/404') && // Exclui a página 404
        !page.includes('/500'), // Exclui a página 500
    }),
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

    icon(), // Inicializa a integração de ícones sem configurações adicionais
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
          disallow: ["/templates/preview/", "/404", "/500"], // Proíbe o rastreamento de páginas internas ou de erro
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
      {
        protocol: 'https',
        hostname: 'placehold.co', // Permite imagens do Placehold.co (usado em protótipos)
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc', // Permite imagens do Pravatar (usado para avatares fake)
      },
    ],
    // Otimizações de performance com Sharp
    service: { // Define o motor de processamento de imagens
      entrypoint: 'astro/assets/services/sharp', // Usa o Sharp, que é extremamente performático
      config: {
        limitInputPixels: false, // Remove o limite de pixels de entrada (cuidado com memória em imagens gigantes)
      },
    },
  },

  devToolbar: { // Configuração da barra de ferramentas lateral do Astro em desenvolvimento
    enabled: true // Mantém a barra ativada para facilitar o debug de ilhas e performance
  },

  vite: { // Configurações específicas para o motor de build Vite
    plugins: [tailwindcss()], // Injeta o plugin do Tailwind CSS no fluxo do Vite
    optimizeDeps: { // Otimização de pré-bundle de dependências
      exclude: ['astro', 'sharp'], // Exclui astro e sharp do pré-bundle para evitar erros de binários nativos
    },
  },
});