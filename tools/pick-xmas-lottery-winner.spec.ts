import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  getDefaultWeekLabel,
  kvTitleForStage,
  parseArgs,
  pickRandomWinner,
  PROD_LOTTERY_KV_TITLE,
  runWinnerPick,
} from "./pick-xmas-lottery-winner.mjs";

describe("pick-xmas-lottery-winner", () => {
  it("parses CLI flags and computes ISO week labels", () => {
    expect(getDefaultWeekLabel(new Date("2026-11-23T12:00:00Z"))).toBe(
      "2026-W48",
    );
    expect(kvTitleForStage("prod")).toBe(PROD_LOTTERY_KV_TITLE);
    expect(kvTitleForStage("pr-21")).toBe("bike-challenge-XmasLottery-pr-21");

    const parsed = parseArgs([
      "--week",
      "2026-W49",
      "--stage",
      "pr-21",
      "--dry-run",
      "--json",
    ]);
    expect(parsed.week).toBe("2026-W49");
    expect(parsed.stage).toBe("pr-21");
    expect(parsed.dryRun).toBe(true);
    expect(parsed.json).toBe(true);
  });

  it("deduplicates entries and excludes past winners so each winner wins at most once", () => {
    const entries = [
      { email: "Alice@Example.com" },
      { email: "alice@example.com" },
      { email: "bob@example.com" },
      { email: "charlie@example.com" },
    ];
    const pastWinners = [{ week: "2026-W47", email: "alice@example.com" }];

    const res = pickRandomWinner(entries, pastWinners, () => 1);
    expect(res).toEqual({
      winner: "charlie@example.com",
      totalEntries: 3,
      excludedWinnersCount: 1,
      eligiblePoolSize: 2,
    });
  });

  it("supports picking from a local JSON file and refuses double-draws without --force", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "xmas-lottery-test-"));
    const poolPath = path.join(tmpDir, "pool.json");
    fs.writeFileSync(
      poolPath,
      JSON.stringify({
        entries: [{ email: "one@test.com" }, { email: "two@test.com" }],
        winners: [{ week: "2026-W48", email: "one@test.com" }],
      }),
    );

    try {
      const already = await runWinnerPick({
        week: "2026-W48",
        file: poolPath,
        dryRun: true,
        force: false,
      });
      expect(already.mode).toBe("already-drawn");
      expect(already.winner).toBe("one@test.com");

      const nextWeek = await runWinnerPick(
        {
          week: "2026-W49",
          file: poolPath,
          dryRun: true,
          force: false,
        },
        {
          randomIndexFn: () => 0,
          now: new Date("2026-11-30T10:00:00Z"),
        },
      );
      expect(nextWeek).toMatchObject({
        ok: true,
        mode: "dry-run",
        persisted: false,
        email: "two@test.com",
        week: "2026-W49",
        eligiblePoolSize: 1,
        totalEntries: 2,
        excludedWinnersCount: 1,
      });

      const forcedRedraw = await runWinnerPick(
        {
          week: "2026-W48",
          file: poolPath,
          dryRun: true,
          force: true,
        },
        {
          randomIndexFn: () => 0,
          now: new Date("2026-11-30T10:00:00Z"),
        },
      );
      expect(forcedRedraw.mode).toBe("dry-run");
      expect(forcedRedraw.email).toBe("two@test.com");

      const listed = await runWinnerPick({
        week: "2026-W48",
        file: poolPath,
        listWinners: true,
      });
      expect(listed).toEqual({
        ok: true,
        mode: "list-winners",
        winners: [{ week: "2026-W48", email: "one@test.com" }],
        totalEntries: 2,
      });

      const exhaustedPath = path.join(tmpDir, "exhausted.json");
      fs.writeFileSync(
        exhaustedPath,
        JSON.stringify({
          entries: [{ email: "one@test.com" }],
          winners: [{ week: "2026-W48", email: "one@test.com" }],
        }),
      );
      await expect(
        runWinnerPick({
          week: "2026-W49",
          file: exhaustedPath,
          dryRun: true,
          force: false,
        }),
      ).rejects.toThrow(/No eligible entrants left/);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("reads entries & past winners from Cloudflare KV and persists new weekly winner", async () => {
    const putBodies = [];
    const fetchMock = vi
      .fn()
      // 1. list KV namespaces
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          result: [{ id: "kv-lottery-prod", title: PROD_LOTTERY_KV_TITLE }],
          result_info: { total_pages: 1 },
        }),
      })
      // 2. list entry: keys
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          result: [
            { name: "entry:winner1@example.com" },
            { name: "entry:rider2@example.com" },
          ],
          result_info: {},
        }),
      })
      // 3. list winner: keys
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          result: [{ name: "winner:2026-W47" }],
          result_info: {},
        }),
      })
      // 4. get winner:2026-W47 value
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            email: "winner1@example.com",
            week: "2026-W47",
          }),
      })
      // 5. put winner:2026-W48 value
      .mockImplementationOnce(async (_url, init) => {
        putBodies.push(JSON.parse(init.body));
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        };
      });

    const result = await runWinnerPick(
      {
        week: "2026-W48",
        stage: "prod",
        dryRun: false,
        force: false,
      },
      {
        accountId: "acct",
        apiToken: "tok",
        fetchImpl: fetchMock,
        randomIndexFn: () => 0,
        now: new Date("2026-11-23T18:30:00Z"),
      },
    );

    expect(result).toEqual({
      ok: true,
      mode: "drawn",
      persisted: true,
      email: "rider2@example.com",
      week: "2026-W48",
      pickedAt: "2026-11-23T18:30:00.000Z",
      eligiblePoolSize: 1,
      totalEntries: 2,
      excludedWinnersCount: 1,
    });
    expect(putBodies).toHaveLength(1);
    expect(putBodies[0]).toMatchObject({
      email: "rider2@example.com",
      week: "2026-W48",
    });
  });
});
