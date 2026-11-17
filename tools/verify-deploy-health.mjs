#!/usr/bin/env node

import { execSync } from "node:child_process";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    url: "https://thebikechallenge.cc",
    expectedSha: null,
    timeoutSeconds: 120,
    pollIntervalSeconds: 5,
  };

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--url" && args[i + 1]) {
      options.url = args[++i].replace(/\/$/, "");
    } else if (args[i] === "--expected-sha" && args[i + 1]) {
      options.expectedSha = args[++i];
    } else if (args[i] === "--timeout" && args[i + 1]) {
      options.timeoutSeconds = Number.parseInt(args[++i], 10);
    }
  }

  if (!options.expectedSha) {
    try {
      options.expectedSha = execSync("git rev-parse HEAD", {
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
    } catch {
      options.expectedSha = "any";
    }
  }

  return options;
}

async function fetchHealth(targetUrl) {
  try {
    const res = await fetch(`${targetUrl}/health.json`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true, data: await res.json() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function main() {
  const opts = parseArgs();
  const start = Date.now();
  while (Date.now() - start < opts.timeoutSeconds * 1000) {
    const res = await fetchHealth(opts.url);
    if (res.ok && res.data?.ok) {
      if (
        opts.expectedSha === "any" ||
        res.data.commitSha === opts.expectedSha
      ) {
        console.log(
          `[Deploy Health] Verified ${opts.url} (${res.data.commitSha})`,
        );
        process.exit(0);
      }
    }
    await new Promise((r) => setTimeout(r, opts.pollIntervalSeconds * 1000));
  }
  console.error(`[Deploy Health] Timed out verifying ${opts.url}`);
  process.exit(1);
}

main();
