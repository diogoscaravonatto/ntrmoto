import { defineConfig } from "cf/config";

export default defineConfig({
  accountId: "a4bb04fd7222c7959ee07dbddf272a8e",
  worker: {
    name: "paginas-ntrmoto",
    compatibilityDate: "2026-11-24",
    workersDev: false,
    previewUrls: false,
    domains: ["www.ntrmoto.com.br"],
    assets: {
      notFoundHandling: "404-page",
    },
    observability: {
      enabled: true,
      logs: {
        enabled: true,
        headSamplingRate: 1,
      },
      traces: {
        enabled: true,
        headSamplingRate: 0.1,
      },
    },
  },
});
