#!/usr/bin/env node

/**
 * verify-deploy-health.mjs
 *
 * Post-merge production health check verification.
 * Queries the /health.json endpoint on production / deploy preview, verifies that the
 * deployed commit matches or is an ancestor of the target commit, and outputs
 * structured evidence for PR reviews and autonomous agent verification.
 */

import { execSync } from "node:child_process";
import { pathToFileURL } from "node:url";

if (
  !process.env.DISCORD_WEBHOOK_URL &&
  typeof process.loadEnvFile === "function"
) {
  try {
    process.loadEnvFile(".env");
  } catch {
    // Ignore missing .env file in CI environments
  }
}

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
    if (process.env.SHIP_PR_SHA) {
      options.expectedSha = process.env.SHIP_PR_SHA;
    } else {
      try {
        options.expectedSha = execSync("git rev-parse HEAD", {
          encoding: "utf-8",
          stdio: ["ignore", "pipe", "ignore"],
        }).trim();
      } catch {
        options.expectedSha = "any";
      }
    }
  }

  return options;
}

function gitIsAncestor(ancestor, descendant) {
  try {
    execSync(`git merge-base --is-ancestor "${ancestor}" "${descendant}"`, {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

async function fetchHealth(targetUrl) {
  const endpoint = `${targetUrl}/health.json`;
  try {
    const res = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status} ${res.statusText}` };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Dispatches a production health embed to `DISCORD_WEBHOOK_URL` if configured.
 * Trims whitespace, validates the URL, and checks `res.ok` before reporting success.
 */
export async function sendDiscordNotification(
  data,
  success,
  fetchImpl = fetch,
  webhookUrlOverride = process.env.DISCORD_WEBHOOK_URL,
) {
  const webhookUrl =
    typeof webhookUrlOverride === "string" ? webhookUrlOverride.trim() : "";
  if (!webhookUrl) return { ok: true, skipped: true };

  let parsedUrl;
  try {
    parsedUrl = new URL(webhookUrl);
  } catch {
    const error = "Invalid DISCORD_WEBHOOK_URL (could not parse URL)";
    console.error(`[Deploy Health Error] ${error}`);
    return { ok: false, error };
  }

  if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
    const error = `Invalid DISCORD_WEBHOOK_URL protocol: ${parsedUrl.protocol}`;
    console.error(`[Deploy Health Error] ${error}`);
    return { ok: false, error };
  }

  const shaText = data.commitSha ? data.commitSha.slice(0, 7) : "unknown";
  const commitUrl =
    data.commit?.url || "https://github.com/bovas85/bike-challenge";

  const embed = {
    title: success
      ? "✅ Production Deploy Verified"
      : "⚠️ Production Health Check Warning",
    color: success ? 0x22c55e : 0xef4444,
    fields: [
      {
        name: "URL",
        value: data.url || "https://thebikechallenge.cc",
        inline: true,
      },
      { name: "Status", value: String(data.status), inline: true },
      { name: "Commit SHA", value: `[${shaText}](${commitUrl})`, inline: true },
      { name: "Commit Message", value: data.commit?.message || "N/A" },
      {
        name: "Deployed At",
        value: data.deploy?.deployedAt || new Date().toISOString(),
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetchImpl(parsedUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Bike Challenge Deploy Guard",
        embeds: [embed],
      }),
    });
    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      const detail = bodyText ? `: ${bodyText.slice(0, 200)}` : "";
      const error = `Discord webhook returned HTTP ${res.status} ${res.statusText}${detail}`;
      console.error(`[Deploy Health Error] ${error}`);
      return { ok: false, status: res.status, error };
    }
    console.log(
      "[Deploy Health] Sent deployment status notification to Discord.",
    );
    return { ok: true, status: res.status };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error(
      `[Deploy Health Error] Could not dispatch Discord webhook: ${error}`,
    );
    return { ok: false, error };
  }
}

function printEvidence(url, data, success) {
  console.log(
    "\n================ HEALTH VERIFICATION EVIDENCE ================",
  );
  console.log(`URL: ${url}`);
  console.log(`Status: ${data.status}`);
  console.log(`Live Commit SHA: ${data.commitSha}`);
  console.log(`Commit Message: ${data.commit?.message}`);
  console.log(`Deployed At: ${data.deploy?.deployedAt}`);
  console.log(`Verified: ${success}`);
  console.log(
    "==============================================================\n",
  );

  const evidence = {
    url,
    status: data.status,
    commitSha: data.commitSha,
    commitMessage: data.commit?.message,
    deployedAt: data.deploy?.deployedAt,
    verified: success,
    timestamp: new Date().toISOString(),
  };

  console.log("```evidence");
  console.log(JSON.stringify(evidence, null, 2));
  console.log("```\n");
}

async function main() {
  const opts = parseArgs();
  console.log(`[Deploy Health] Verifying production health: ${opts.url}`);
  console.log(`[Deploy Health] Expected commit SHA: ${opts.expectedSha}`);

  const startTime = Date.now();
  const maxWaitMs = opts.timeoutSeconds * 1000;
  let lastResult = null;

  while (Date.now() - startTime < maxWaitMs) {
    const result = await fetchHealth(opts.url);
    lastResult = result;

    if (result.ok && result.data && result.data.ok) {
      const liveSha = result.data.commitSha;
      console.log(
        `[Deploy Health] Live commit SHA: ${liveSha} (Environment: ${result.data.deploy?.environment || "unknown"})`,
      );

      if (opts.expectedSha === "any" || liveSha === opts.expectedSha) {
        console.log(`[Deploy Health] Exact commit match verified: ${liveSha}`);
        printEvidence(opts.url, result.data, true);
        await sendDiscordNotification({ ...result.data, url: opts.url }, true);
        process.exit(0);
      }

      if (
        liveSha &&
        liveSha !== "unknown" &&
        gitIsAncestor(opts.expectedSha, liveSha)
      ) {
        console.log(
          `[Deploy Health] Live build ${liveSha} is ahead of target ${opts.expectedSha} (clean progression).`,
        );
        printEvidence(opts.url, result.data, true);
        await sendDiscordNotification({ ...result.data, url: opts.url }, true);
        process.exit(0);
      }
    } else {
      console.log(
        `[Deploy Health] Probe status: ${result.error || "unhealthy"}`,
      );
    }

    console.log(
      `[Deploy Health] Waiting ${opts.pollIntervalSeconds}s for deployment to update...`,
    );
    await new Promise((r) => setTimeout(r, opts.pollIntervalSeconds * 1000));
  }

  console.error(
    `[Deploy Health Error] Timeout after ${opts.timeoutSeconds}s waiting for ${opts.expectedSha} to land live.`,
  );
  const failureData = lastResult?.data || {
    url: opts.url,
    status: "unhealthy",
    commitSha: opts.expectedSha,
    commit: {
      message: `Probe error or timeout: ${lastResult?.error || "HTTP error"}`,
    },
    deploy: {
      environment: "production",
      deployedAt: new Date().toISOString(),
    },
  };
  printEvidence(opts.url, failureData, false);
  await sendDiscordNotification({ ...failureData, url: opts.url }, false);
  process.exit(1);
}

const isEntrypoint =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  main().catch((err) => {
    console.error("[Deploy Health Fatal]:", err);
    process.exit(1);
  });
}
