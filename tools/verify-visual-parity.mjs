#!/usr/bin/env node

/**
 * verify-visual-parity.mjs
 *
 * ADR 0001 compliant multi-viewport visual verification across all routes
 * (/, /offers, /blog, /event) with desktop (1280x800) & mobile (390x844)
 * screenshots + H.264 walkthrough recording.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const args = process.argv.slice(2);
let origin = "http://127.0.0.1:3000";
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--url" && args[i + 1]) {
    origin = args[++i].replace(/\/$/, "");
  }
}

const OUT_DIR = path.resolve(".autopilot/visual-parity");
fs.mkdirSync(OUT_DIR, { recursive: true });

const ROUTES = [
  { name: "home", path: "/" },
  { name: "offers", path: "/offers" },
  { name: "blog", path: "/blog" },
  { name: "event", path: "/event" },
];

const browser = await chromium.launch({ headless: true });
const report = [];

try {
  // Desktop walkthrough + screenshots
  const desktopCtx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 800 } },
  });
  const dPage = await desktopCtx.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  dPage.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  dPage.on("pageerror", (e) => pageErrors.push(e.message));

  for (const r of ROUTES) {
    const url = `${origin}${r.path}`;
    await dPage.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await dPage.waitForTimeout(500);
    const totalHeight = await dPage.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < totalHeight; y += 700) {
      await dPage.evaluate((pos) => window.scrollTo(0, pos), y);
      await dPage.waitForTimeout(150);
    }
    await dPage.evaluate(() => window.scrollTo(0, 0));
    await dPage.waitForTimeout(300);
    const desktopShot = path.join(OUT_DIR, `${r.name}-desktop.png`);
    await dPage.screenshot({ path: desktopShot, fullPage: true });

    const metrics = await dPage.evaluate(() => ({
      title: document.title,
      scrollHeight: document.body.scrollHeight,
      overflowX:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
      brokenImages: Array.from(document.querySelectorAll("img")).filter(
        (img) => !img.complete || img.naturalWidth === 0,
      ).length,
    }));
    report.push({ route: r.path, viewport: "desktop", ...metrics });
  }

  const rawVideo = await dPage.video()?.path();
  await desktopCtx.close();

  if (rawVideo) {
    const mp4Path = path.join(OUT_DIR, "walkthrough-desktop.mp4");
    try {
      execFileSync(
        "ffmpeg",
        [
          "-y",
          "-i",
          rawVideo,
          "-vf",
          "scale=trunc(iw/2)*2:trunc(ih/2)*2",
          "-c:v",
          "libx264",
          "-preset",
          "fast",
          "-crf",
          "23",
          "-pix_fmt",
          "yuv420p",
          "-movflags",
          "+faststart",
          mp4Path,
        ],
        { stdio: "ignore" },
      );
      fs.rmSync(rawVideo, { force: true });
    } catch {
      // Keep webm if ffmpeg fails
    }
  }

  // Mobile screenshots
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const mPage = await mobileCtx.newPage();
  for (const r of ROUTES) {
    const url = `${origin}${r.path}`;
    await mPage.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await mPage.waitForTimeout(400);
    const mobileShot = path.join(OUT_DIR, `${r.name}-mobile.png`);
    await mPage.screenshot({ path: mobileShot, fullPage: true });
    const metrics = await mPage.evaluate(() => ({
      overflowX:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
      brokenImages: Array.from(document.querySelectorAll("img")).filter(
        (img) => !img.complete || img.naturalWidth === 0,
      ).length,
    }));
    report.push({ route: r.path, viewport: "mobile", ...metrics });
  }
  await mobileCtx.close();

  console.log(
    JSON.stringify({ ok: true, consoleErrors, pageErrors, report }, null, 2),
  );
  if (
    consoleErrors.length > 0 ||
    pageErrors.length > 0 ||
    report.some((x) => x.overflowX || x.brokenImages > 0)
  ) {
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
