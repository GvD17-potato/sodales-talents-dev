import { existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";

const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:3004";
const outputDir = join(tmpdir(), "sodales-talents-playwright-qa");
mkdirSync(outputDir, { recursive: true });

const browserCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

const executablePath = browserCandidates.find(existsSync);
if (!executablePath) {
  throw new Error("No supported local Chromium browser was found.");
}

const checks = [
  { name: "home-375", path: "/", width: 375, height: 1200 },
  { name: "home-768", path: "/", width: 768, height: 1200 },
  { name: "home-1280", path: "/", width: 1280, height: 1200 },
  { name: "home-1440", path: "/", width: 1440, height: 1200 },
  { name: "directory-375", path: "/talents", width: 375, height: 1200 },
  { name: "directory-1440", path: "/talents", width: 1440, height: 1200 },
  {
    name: "profile-375",
    path: "/talents/lena-ortiz",
    width: 375,
    height: 1200,
  },
  { name: "login-375", path: "/login", width: 375, height: 1200 },
];

const browser = await chromium.launch({ executablePath, headless: true });
let failed = false;

try {
  for (const check of checks) {
    const context = await browser.newContext({
      viewport: { width: check.width, height: check.height },
      reducedMotion: "no-preference",
    });
    await context.addInitScript(() => {
      window.sessionStorage.setItem("sodales-talents-session-started", "true");
    });
    const page = await context.newPage();
    const response = await page.goto(`${baseUrl}${check.path}`, {
      waitUntil: "networkidle",
    });
    const metrics = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      title: document.title,
    }));
    const screenshot = join(outputDir, `${check.name}.png`);
    await page.screenshot({ path: screenshot, fullPage: false });
    const pass = response?.status() === 200 && metrics.scrollWidth <= metrics.innerWidth;
    if (!pass) failed = true;
    console.log(
      JSON.stringify({
        check: check.name,
        status: response?.status(),
        viewport: metrics.innerWidth,
        scrollWidth: metrics.scrollWidth,
        screenshot,
        pass,
      }),
    );
    await context.close();
  }

  const unknownContext = await browser.newContext({
    viewport: { width: 768, height: 900 },
  });
  const unknownPage = await unknownContext.newPage();
  const unknownResponse = await unknownPage.goto(
    `${baseUrl}/talents/not-a-real-profile`,
    { waitUntil: "networkidle" },
  );
  const unknownPass = unknownResponse?.status() === 404;
  if (!unknownPass) failed = true;
  console.log(
    JSON.stringify({
      check: "unknown-profile-404",
      status: unknownResponse?.status(),
      pass: unknownPass,
    }),
  );
  await unknownContext.close();

  const reducedContext = await browser.newContext({
    viewport: { width: 375, height: 900 },
    reducedMotion: "reduce",
  });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
  const entrance = reducedPage.locator(".brand-entrance");
  let entrancePresent = false;
  try {
    await entrance.waitFor({ state: "attached", timeout: 500 });
    entrancePresent = true;
  } catch {
    entrancePresent = false;
  }
  let entranceCleared = false;
  try {
    await entrance.waitFor({ state: "detached", timeout: 1000 });
    entranceCleared = true;
  } catch {
    entranceCleared = false;
  }
  const reducedPass = entrancePresent && entranceCleared;
  if (!reducedPass) failed = true;
  console.log(
    JSON.stringify({
      check: "reduced-motion-entrance",
      entrancePresent,
      entranceCleared,
      pass: reducedPass,
    }),
  );
  await reducedContext.close();
} finally {
  await browser.close();
}

if (failed) process.exitCode = 1;
