import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as sleep } from "node:timers/promises";
import type { TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    smokeBaseUrl: string;
  }
}

let spawned: ChildProcess | undefined;

/** Obtém uma porta TCP livre alocada pelo sistema operacional. */
async function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("Falha ao alocar porta livre")));
        return;
      }
      const { port } = address;
      server.close((err) => (err ? reject(err) : resolve(port)));
    });
  });
}

/** Servidor responde? (200 OK na raiz = Astro pronto; falha/404 de boot = ainda subindo). */
async function isUp(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5_000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function setup(project: TestProject) {
  if (process.env.SMOKE_BASE_URL) {
    project.provide("smokeBaseUrl", process.env.SMOKE_BASE_URL);
    return;
  }

  const port = process.env.SMOKE_PORT ?? String(await getFreePort());
  const base = `http://127.0.0.1:${port}`;
  project.provide("smokeBaseUrl", base);

  console.log(`[smoke] subindo \`astro dev\` em ${base}...`);
  const childEnv: NodeJS.ProcessEnv = { ...process.env, NODE_ENV: "development" };
  delete childEnv.VITEST;
  delete childEnv.VITEST_POOL_ID;
  delete childEnv.VITEST_WORKER_ID;

  spawned = spawn(
    process.execPath,
    [
      "./node_modules/astro/bin/astro.mjs",
      "dev",
      "--host",
      "127.0.0.1",
      "--port",
      port,
      "--ignore-lock",
    ],
    {
      stdio: ["ignore", "pipe", "pipe"],
      env: childEnv,
    },
  );
  const stderrChunks: string[] = [];
  spawned.stdout?.resume();
  spawned.stderr?.on("data", (chunk: Buffer) => stderrChunks.push(chunk.toString()));

  const deadline = Date.now() + 110_000;
  while (Date.now() < deadline) {
    if (spawned.exitCode !== null) {
      throw new Error(
        `[smoke] astro dev encerrou com código ${spawned.exitCode}: ${stderrChunks.join("")}`,
      );
    }
    if (await isUp(base)) {
      console.log("[smoke] servidor pronto");
      return;
    }
    await sleep(1_000);
  }
  throw new Error(`[smoke] astro dev não ficou pronto a tempo: ${stderrChunks.join("")}`);
}

export async function teardown() {
  if (spawned) spawned.kill("SIGTERM");
}
