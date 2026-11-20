import { describe, expect, it, vi } from "vitest";
import {
  isOrphanPreviewKv,
  isOrphanPreviewWorker,
  parseArgs,
  previewNamesForPr,
  PROD_KV_TITLE,
  PROD_WORKER_NAME,
  runCleanup,
} from "./cleanup-cloudflare-previews.mjs";

describe("cleanup-cloudflare-previews", () => {
  it("parses CLI flags and validates --pr", () => {
    expect(parseArgs(["--pr", "11", "--apply"])).toEqual({
      pr: 11,
      pruneOrphans: false,
      keepPrs: new Set(),
      apply: true,
      json: false,
    });

    expect(
      parseArgs(["--prune-orphans", "--keep-pr", "9, 11", "--json"]),
    ).toEqual({
      pr: null,
      pruneOrphans: true,
      keepPrs: new Set([9, 11]),
      apply: false,
      json: true,
    });

    expect(() => parseArgs([])).toThrow(/Specify either --pr/);
    expect(() => parseArgs(["--pr", "abc"])).toThrow(/Invalid --pr/);
  });

  it("never marks production Worker or KV namespace as orphaned", () => {
    expect(isOrphanPreviewWorker(PROD_WORKER_NAME)).toBe(false);
    expect(isOrphanPreviewWorker("unrelated-worker")).toBe(false);
    expect(
      isOrphanPreviewWorker("bike-challenge-bikechallengesi7wpd73hn6emnaz"),
    ).toBe(true);
    expect(isOrphanPreviewWorker("bike-challenge-branch-feat-foo")).toBe(true);
    expect(isOrphanPreviewWorker("bike-challenge-pr-11", new Set([11]))).toBe(
      false,
    );
    expect(isOrphanPreviewWorker("bike-challenge-pr-11", new Set([9]))).toBe(
      true,
    );

    expect(isOrphanPreviewKv(PROD_KV_TITLE)).toBe(false);
    expect(isOrphanPreviewKv("other-kv")).toBe(false);
    expect(isOrphanPreviewKv("bike-challenge-EventRsvps-pr-9-abc123")).toBe(
      true,
    );
    expect(
      isOrphanPreviewKv("bike-challenge-EventRsvps-pr-11", new Set([11])),
    ).toBe(false);
  });

  it("deletes deterministic PR preview Worker and KV namespace on --pr --apply", async () => {
    expect(previewNamesForPr(11)).toEqual({
      workerName: "bike-challenge-pr-11",
      kvTitle: "bike-challenge-EventRsvps-pr-11",
    });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          result: [
            { id: "kv-prod", title: PROD_KV_TITLE },
            { id: "kv-11", title: "bike-challenge-EventRsvps-pr-11" },
          ],
          result_info: { total_pages: 1 },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

    const res = await runCleanup(
      { pr: 11, pruneOrphans: false, keepPrs: new Set(), apply: true },
      { accountId: "acct", apiToken: "tok", fetchImpl: fetchMock },
    );

    expect(res).toEqual({
      ok: true,
      dryRun: false,
      targetWorkers: ["bike-challenge-pr-11"],
      targetKvs: ["bike-challenge-EventRsvps-pr-11"],
      deletedWorkers: ["bike-challenge-pr-11"],
      missingWorkers: [],
      deletedKvs: ["bike-challenge-EventRsvps-pr-11"],
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1]![0]).toContain(
      "/workers/scripts/bike-challenge-pr-11",
    );
    expect(fetchMock.mock.calls[2]![0]).toContain(
      "/storage/kv/namespaces/kv-11",
    );
  });

  it("supports dry-run orphan pruning while protecting prod and open PRs", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          result: [
            { id: PROD_WORKER_NAME },
            { id: "bike-challenge-pr-11" },
            { id: "bike-challenge-bikechallengesiold123" },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          result: [
            { id: "kv-prod", title: PROD_KV_TITLE },
            { id: "kv-11", title: "bike-challenge-EventRsvps-pr-11" },
            { id: "kv-old", title: "bike-challenge-EventRsvps-pr-1-xyz" },
          ],
          result_info: { total_pages: 1 },
        }),
      });

    const res = await runCleanup(
      { pr: null, pruneOrphans: true, keepPrs: new Set([11]), apply: false },
      { accountId: "acct", apiToken: "tok", fetchImpl: fetchMock },
    );

    expect(res).toEqual({
      ok: true,
      dryRun: true,
      targetWorkers: ["bike-challenge-bikechallengesiold123"],
      targetKvs: ["bike-challenge-EventRsvps-pr-1-xyz"],
      deletedWorkers: [],
      missingWorkers: [],
      deletedKvs: [],
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
