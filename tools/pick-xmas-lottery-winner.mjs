#!/usr/bin/env node

/**
 * pick-xmas-lottery-winner.mjs
 *
 * Local CLI to pick one cryptographically random weekly winner from the
 * `bike-challenge-XmasLottery-<stage>` Cloudflare KV namespace (or a local JSON
 * file via `--file`). Past winners recorded under `winner:*` are excluded so
 * each winner can only win once.
 *
 * Usage:
 *   node tools/pick-xmas-lottery-winner.mjs [--week 2026-W48] [--stage prod] [--dry-run] [--list-winners] [--force] [--json]
 *   node tools/pick-xmas-lottery-winner.mjs --file entries.json --dry-run
 */

import { randomInt } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const CF_API_BASE = "https://api.cloudflare.com/client/v4";
export const PROD_LOTTERY_KV_TITLE = "bike-challenge-XmasLottery-prod";

export function getDefaultWeekLabel(now = new Date()) {
  const utc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const dayNum = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((utc - yearStart) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function kvTitleForStage(stage = "prod") {
  return stage === "prod"
    ? PROD_LOTTERY_KV_TITLE
    : `bike-challenge-XmasLottery-${stage}`;
}

export function parseArgs(argv) {
  const opts = {
    week: getDefaultWeekLabel(),
    stage: "prod",
    kvId: null,
    file: null,
    dryRun: false,
    force: false,
    listWinners: false,
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--week" && argv[i + 1]) {
      opts.week = argv[++i].trim();
    } else if (arg === "--stage" && argv[i + 1]) {
      opts.stage = argv[++i].trim();
    } else if (arg === "--kv-id" && argv[i + 1]) {
      opts.kvId = argv[++i].trim();
    } else if (arg === "--file" && argv[i + 1]) {
      opts.file = argv[++i];
    } else if (arg === "--dry-run") {
      opts.dryRun = true;
    } else if (arg === "--force") {
      opts.force = true;
    } else if (arg === "--list-winners") {
      opts.listWinners = true;
    } else if (arg === "--json") {
      opts.json = true;
    } else if (arg === "--help" || arg === "-h") {
      opts.help = true;
    } else {
      throw new Error(`Unknown or incomplete argument: ${arg}`);
    }
  }

  if (!opts.week) {
    throw new Error("--week must be a non-empty label.");
  }

  return opts;
}

export function pickRandomWinner(
  entries,
  pastWinners = [],
  randomIndexFn = (len) => randomInt(0, len),
) {
  const normalizedPastWinners = new Set(
    pastWinners.map((w) =>
      String(typeof w === "string" ? w : w.email || "")
        .trim()
        .toLowerCase(),
    ),
  );

  const uniqueEntries = [];
  const seen = new Set();
  for (const item of entries) {
    const email = String(typeof item === "string" ? item : item.email || "")
      .trim()
      .toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    uniqueEntries.push(email);
  }

  const eligible = uniqueEntries.filter(
    (email) => !normalizedPastWinners.has(email),
  );

  if (eligible.length === 0) {
    return {
      winner: null,
      totalEntries: uniqueEntries.length,
      excludedWinnersCount: uniqueEntries.length - eligible.length,
      eligiblePoolSize: 0,
    };
  }

  const index = randomIndexFn(eligible.length);
  return {
    winner: eligible[index],
    totalEntries: uniqueEntries.length,
    excludedWinnersCount: uniqueEntries.length - eligible.length,
    eligiblePoolSize: eligible.length,
  };
}

function loadDotEnvIfPresent(envPath = path.resolve(".env")) {
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function cfJsonRequest(
  endpointPath,
  { method = "GET", accountId, apiToken, body, fetchImpl = fetch },
) {
  const headers = {
    Authorization: `Bearer ${apiToken}`,
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetchImpl(
    `${CF_API_BASE}/accounts/${accountId}${endpointPath}`,
    {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    },
  );

  const data = await res.json();
  if (!res.ok || data.success === false) {
    const detail = data?.errors?.[0]?.message || `HTTP ${res.status}`;
    throw new Error(
      `Cloudflare API ${method} ${endpointPath} failed: ${detail}`,
    );
  }
  return data;
}

async function resolveKvNamespaceId(title, ctx) {
  let page = 1;
  while (true) {
    const data = await cfJsonRequest(
      `/storage/kv/namespaces?page=${page}&per_page=100`,
      ctx,
    );
    const items = Array.isArray(data.result) ? data.result : [];
    const match = items.find((ns) => ns.title === title);
    if (match) return match.id;
    const totalPages = data.result_info?.total_pages ?? 1;
    if (page >= totalPages || items.length === 0) break;
    page += 1;
  }
  throw new Error(`Cloudflare KV namespace "${title}" was not found.`);
}

async function listKvKeysByPrefix(namespaceId, prefix, ctx) {
  const keys = [];
  let cursor = "";
  while (true) {
    const qs = new URLSearchParams({ prefix, limit: "1000" });
    if (cursor) qs.set("cursor", cursor);
    const data = await cfJsonRequest(
      `/storage/kv/namespaces/${encodeURIComponent(namespaceId)}/keys?${qs.toString()}`,
      ctx,
    );
    const items = Array.isArray(data.result) ? data.result : [];
    for (const item of items) {
      if (item?.name) keys.push(item.name);
    }
    const nextCursor = data.result_info?.cursor;
    if (!nextCursor) break;
    cursor = nextCursor;
  }
  return keys;
}

async function getKvValueJson(namespaceId, key, ctx) {
  const res = await ctx.fetchImpl(
    `${CF_API_BASE}/accounts/${ctx.accountId}/storage/kv/namespaces/${encodeURIComponent(namespaceId)}/values/${encodeURIComponent(key)}`,
    {
      headers: {
        Authorization: `Bearer ${ctx.apiToken}`,
      },
      signal: AbortSignal.timeout(15000),
    },
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed reading KV key "${key}": HTTP ${res.status}`);
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function putKvValueJson(namespaceId, key, value, ctx) {
  const res = await ctx.fetchImpl(
    `${CF_API_BASE}/accounts/${ctx.accountId}/storage/kv/namespaces/${encodeURIComponent(namespaceId)}/values/${encodeURIComponent(key)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${ctx.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(value),
      signal: AbortSignal.timeout(15000),
    },
  );
  const data = await res.json();
  if (!res.ok || data.success === false) {
    const detail = data?.errors?.[0]?.message || `HTTP ${res.status}`;
    throw new Error(`Failed writing KV key "${key}": ${detail}`);
  }
}

export async function runWinnerPick(
  opts,
  {
    accountId = process.env.CLOUDFLARE_ACCOUNT_ID,
    apiToken = process.env.CLOUDFLARE_API_TOKEN,
    fetchImpl = fetch,
    randomIndexFn,
    now = new Date(),
  } = {},
) {
  let entries;
  let winners;
  let namespaceId = opts.kvId || null;

  if (opts.file) {
    const raw = JSON.parse(fs.readFileSync(path.resolve(opts.file), "utf8"));
    entries = Array.isArray(raw) ? raw : raw.entries || [];
    winners = Array.isArray(raw.winners) ? raw.winners : [];
  } else {
    if (!accountId || !apiToken) {
      throw new Error(
        "CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required (or pass --file <path> for local testing).",
      );
    }

    const ctx = { accountId, apiToken, fetchImpl };
    if (!namespaceId) {
      namespaceId = await resolveKvNamespaceId(
        kvTitleForStage(opts.stage),
        ctx,
      );
    }

    const [entryKeys, winnerKeys] = await Promise.all([
      listKvKeysByPrefix(namespaceId, "entry:", ctx),
      listKvKeysByPrefix(namespaceId, "winner:", ctx),
    ]);

    entries = entryKeys.map((key) => ({
      email: key.slice("entry:".length),
    }));

    winners = (
      await Promise.all(
        winnerKeys.map(async (key) => {
          const record = await getKvValueJson(namespaceId, key, ctx);
          return record
            ? { week: key.slice("winner:".length), ...record }
            : null;
        }),
      )
    ).filter(Boolean);
  }

  if (opts.listWinners) {
    return {
      ok: true,
      mode: "list-winners",
      winners,
      totalEntries: entries.length,
    };
  }

  const existingForWeek = winners.find((w) => w.week === opts.week);
  if (existingForWeek && !opts.force) {
    return {
      ok: true,
      mode: "already-drawn",
      week: opts.week,
      winner: existingForWeek.email,
      record: existingForWeek,
      totalEntries: entries.length,
    };
  }

  const pick = pickRandomWinner(entries, winners, randomIndexFn);
  if (!pick.winner) {
    throw new Error(
      `No eligible entrants left (totalEntries=${pick.totalEntries}, excludedPastWinners=${pick.excludedWinnersCount}).`,
    );
  }

  const record = {
    email: pick.winner,
    week: opts.week,
    pickedAt: now.toISOString(),
    eligiblePoolSize: pick.eligiblePoolSize,
    totalEntries: pick.totalEntries,
  };

  let persisted = false;
  if (!opts.dryRun && !opts.file) {
    const ctx = { accountId, apiToken, fetchImpl };
    await putKvValueJson(namespaceId, `winner:${opts.week}`, record, ctx);
    persisted = true;
  }

  return {
    ok: true,
    mode: opts.dryRun ? "dry-run" : "drawn",
    persisted,
    ...record,
    excludedWinnersCount: pick.excludedWinnersCount,
  };
}

async function main() {
  loadDotEnvIfPresent();
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(
      "Usage: node tools/pick-xmas-lottery-winner.mjs [--week YYYY-Www] [--stage prod] [--dry-run] [--list-winners] [--force] [--file pool.json] [--json]",
    );
    return;
  }

  const result = await runWinnerPick(opts);
  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (result.mode === "list-winners") {
    console.log(`Total entries: ${result.totalEntries}`);
    if (result.winners.length === 0) {
      console.log("No weekly winners drawn yet.");
      return;
    }
    for (const w of result.winners) {
      console.log(`- ${w.week}: ${w.email} (picked ${w.pickedAt || "n/a"})`);
    }
    return;
  }

  if (result.mode === "already-drawn") {
    console.log(
      `Week ${result.week} already has a recorded winner: ${result.winner} (pass --force to re-draw).`,
    );
    return;
  }

  console.log(
    `[Xmas Lottery${result.mode === "dry-run" ? " - DRY RUN" : ""}] Week ${result.week}`,
  );
  console.log(`  Winner: ${result.email}`);
  console.log(
    `  Pool: ${result.eligiblePoolSize} eligible / ${result.totalEntries} total (${result.excludedWinnersCount} past winner(s) excluded)`,
  );
  console.log(
    `  Saved to Cloudflare KV: ${result.persisted ? "yes" : "no (dry-run or local file)"}`,
  );
}

const isEntrypoint =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  main().catch((err) => {
    console.error("[Xmas Lottery CLI Error]:", err.message);
    process.exit(1);
  });
}
