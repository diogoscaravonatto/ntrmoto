import { defineConfig } from "vitest/config";

// Smoke tests de render: sobem (ou reusam) o astro dev e batem em todas as rotas.
export default defineConfig({
  test: {
    globalSetup: ["./tests/global-setup.ts"],
    include: ["tests/**/*.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
