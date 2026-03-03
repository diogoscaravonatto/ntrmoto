/**
 * Fonte: https://github.com/ota-meshi/eslint-plugin-astro
 * Configuração do ESLint para o projeto.
 * Este arquivo define as regras de linting para garantir a qualidade do código,
 * padronização e acessibilidade (A11Y), especialmente em componentes Astro e TypeScript,
 * ajudando a manter um código limpo e livre de erros comuns.
 */
import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';
import astroParser from 'astro-eslint-parser';
import tsParser from '@typescript-eslint/parser';

export default [
    // 1. Configurações Globais e TypeScript
    ...tseslint.configs.recommended,

    // 2. Configurações Específicas para Astro
    ...eslintPluginAstro.configs.recommended,

    // 3. Regras de Acessibilidade (A11Y) otimizadas para Astro
    ...eslintPluginAstro.configs['jsx-a11y-recommended'],

    {
        files: ["**/*.astro"],
        languageOptions: {
            parser: astroParser,
            parserOptions: {
                parser: tsParser,
                extraFileExtensions: [".astro"],
                sourceType: "module",
            },
        },
        rules: {
            // --- Melhores Práticas de Acessibilidade ---
            "astro/jsx-a11y/alt-text": "error",
            "astro/jsx-a11y/anchor-is-valid": "error",
            "astro/jsx-a11y/no-autofocus": "warn",
            "astro/jsx-a11y/label-has-associated-control": "error",
            "astro/jsx-a11y/click-events-have-key-events": "warn",
            "astro/jsx-a11y/no-static-element-interactions": "warn",

            // --- Segurança e Qualidade de Código (Vibe Coding Best Practices) ---
            "astro/no-set-html-directive": "warn", // Evitar XSS e preferir componentes estruturados
            "astro/no-unused-css-selector": "error", // Manter CSS limpo e modular
            "astro/prefer-class-list-directive": "warn", // Incentivar uso do class:list do Astro
            "astro/no-conflict-set-directives": "error", // Evitar conflitos de diretivas

            // --- TypeScript ---
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
        },
    },
    {
        // Ignorar arquivos de build e configuração
        ignores: ["dist/", ".astro/", "node_modules/"]
    },
];
