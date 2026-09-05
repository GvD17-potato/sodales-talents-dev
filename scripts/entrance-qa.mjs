import { existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";

const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:3004";
const outputDir = join(tmpdir(), "sodales-talents-entrance-qa");
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

let failed = false;

function record(check, pass, details = {}) {
  if (!pass) failed = true;
  console.log(JSON.stringify({ check, ...details, pass }));
}

function isSkipped(state) {
  return (
    state.mode === "skip" &&
    (!state.entranceAttached || state.display === "none")
  );
}

async function entranceState(page) {
  return page.evaluate(() => {
    const entrance = document.querySelector(".brand-entrance");
    const asset = document.querySelector(".brand-entrance__asset");
    const entranceStyle = entrance ? getComputedStyle(entrance) : null;
    const assetStyle = asset ? getComputedStyle(asset) : null;
    const center = document.elementFromPoint(
      window.innerWidth / 2,
      window.innerHeight / 2,
    );

    return {
      mode: document.documentElement.dataset.sodalesEntrance,
      entranceAttached: Boolean(entrance),
      display: entranceStyle?.display ?? null,
      visibility: entranceStyle?.visibility ?? null,
      background: entranceStyle?.backgroundColor ?? null,
      centerCovered: Boolean(entrance && center && entrance.contains(center)),
      entranceAnimation: entranceStyle?.animationName ?? null,
      entranceDuration: entranceStyle?.animationDuration ?? null,
      assetTransform: assetStyle?.transform ?? null,
      assetAnimation: assetStyle?.animationName ?? null,
    };
  });
}

async function waitForAnimationTime(page, milliseconds) {
  await page.waitForFunction(
    (minimumTime) => {
      const asset = document.querySelector(".brand-entrance__asset");
      const animation = asset
        ?.getAnimations()
        .find(
          (candidate) =>
            "animationName" in candidate &&
            candidate.animationName === "entrance-standard-symbol",
        );
      return Number(animation?.currentTime ?? 0) >= minimumTime;
    },
    milliseconds,
    { timeout: 2000 },
  );
}

const browser = await chromium.launch({ executablePath, headless: true });

try {
  const standardContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "no-preference",
  });
  const standardPage = await standardContext.newPage();
  await standardPage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });

  const standardInitial = await entranceState(standardPage);
  record(
    "standard-first-visible-frame",
    standardInitial.mode === "standard" &&
      standardInitial.display === "grid" &&
      standardInitial.visibility === "visible" &&
      standardInitial.background === "rgb(17, 17, 17)" &&
      standardInitial.centerCovered,
    standardInitial,
  );

  await waitForAnimationTime(standardPage, 320);
  const holdBox = await standardPage
    .locator(".brand-entrance__asset")
    .boundingBox();
  await standardPage.screenshot({
    path: join(outputDir, "standard-hold.png"),
  });

  await waitForAnimationTime(standardPage, 1220);
  const scaleBox = await standardPage
    .locator(".brand-entrance__asset")
    .boundingBox();
  await standardPage.screenshot({
    path: join(outputDir, "standard-scale.png"),
  });
  const scaleRatio =
    holdBox && scaleBox ? scaleBox.width / holdBox.width : 0;
  record("standard-obvious-scale", scaleRatio >= 1.5, {
    holdWidth: holdBox?.width,
    scaleWidth: scaleBox?.width,
    scaleRatio,
  });

  await standardPage
    .locator(".brand-entrance")
    .waitFor({ state: "detached", timeout: 2500 });
  record("standard-clears-to-homepage", true);

  await standardPage.reload({ waitUntil: "domcontentloaded" });
  const refreshState = await entranceState(standardPage);
  record(
    "refresh-does-not-replay",
    isSkipped(refreshState),
    refreshState,
  );

  const routeTransition = standardPage.locator(".route-transition");
  await standardPage.getByRole("link", { name: "Find talent" }).click();
  const topLevelActive = await routeTransition.evaluate((element) =>
    element.classList.contains("route-transition--active"),
  );
  record("standard-top-level-route-transition", topLevelActive);
  await standardPage.waitForURL("**/talents");
  await standardPage.waitForFunction(
    () =>
      !document
        .querySelector(".route-transition")
        ?.classList.contains("route-transition--active"),
  );

  const profileLink = standardPage.locator('a[href="/talents/lena-ortiz"]').first();
  await profileLink.click();
  const profileOverlayActive = await routeTransition.evaluate((element) =>
    element.classList.contains("route-transition--active"),
  );
  record("profile-drilldown-skips-route-overlay", !profileOverlayActive);
  await standardPage.waitForURL("**/talents/lena-ortiz");
  await standardContext.close();

  const reducedContext = await browser.newContext({
    viewport: { width: 375, height: 900 },
    reducedMotion: "reduce",
  });
  const reducedPage = await reducedContext.newPage();
  const reducedCdp = await reducedContext.newCDPSession(reducedPage);
  await reducedCdp.send("Animation.enable");
  await reducedCdp.send("Animation.setPlaybackRate", { playbackRate: 0.1 });
  await reducedPage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  const reducedEntrance = reducedPage.locator(".brand-entrance");
  await reducedEntrance.waitFor({ state: "visible", timeout: 1000 });
  const reducedInitial = await entranceState(reducedPage);
  const reducedBoxStart = await reducedPage
    .locator(".brand-entrance__asset")
    .boundingBox();
  await reducedPage.waitForTimeout(140);
  const reducedBoxEnd = await reducedPage
    .locator(".brand-entrance__asset")
    .boundingBox();
  await reducedPage.screenshot({
    path: join(outputDir, "reduced-static.png"),
  });
  const reducedScaleDelta =
    reducedBoxStart && reducedBoxEnd
      ? Math.abs(reducedBoxEnd.width - reducedBoxStart.width)
      : Number.POSITIVE_INFINITY;
  record(
    "reduced-static-symbol-and-dissolve",
      reducedInitial.mode === "reduced" &&
      reducedInitial.display === "grid" &&
      reducedInitial.visibility === "visible" &&
      reducedInitial.background === "rgb(17, 17, 17)" &&
      reducedInitial.centerCovered &&
      reducedInitial.entranceAnimation === "entrance-reduced-field" &&
      reducedInitial.entranceDuration === "0.36s" &&
      reducedInitial.assetTransform === "none" &&
      reducedInitial.assetAnimation === "none" &&
      reducedScaleDelta < 0.5,
    { ...reducedInitial, reducedScaleDelta },
  );
  await reducedCdp.send("Animation.setPlaybackRate", { playbackRate: 1 });
  await reducedEntrance.waitFor({ state: "detached", timeout: 1000 });
  await reducedPage.getByRole("link", { name: "Find talent" }).click();
  const reducedRouteDisplay = await reducedPage
    .locator(".route-transition")
    .evaluate((element) => getComputedStyle(element).display);
  record("reduced-skips-route-overlay", reducedRouteDisplay === "none", {
    display: reducedRouteDisplay,
  });
  await reducedPage.waitForURL("**/talents");
  await reducedContext.close();

  for (const path of ["/talents", "/talents/lena-ortiz", "/login"]) {
    const context = await browser.newContext({
      viewport: { width: 1024, height: 800 },
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    await page.goto(`${baseUrl}${path}`, { waitUntil: "domcontentloaded" });
    const state = await entranceState(page);
    record(
      `deep-link-skips-entrance:${path}`,
      isSkipped(state),
      state,
    );

    if (path === "/talents") {
      await page.getByRole("link", { name: "Sodales Talents home" }).click();
      await page.waitForURL(`${baseUrl}/`);
      const laterHomeState = await entranceState(page);
      record(
        "deep-link-session-never-replays-on-home",
        isSkipped(laterHomeState),
        laterHomeState,
      );
    }

    await context.close();
  }

  for (const dismissal of ["Escape", "click"]) {
    const context = await browser.newContext({
      viewport: { width: 1024, height: 800 },
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    const entrance = page.locator(".brand-entrance");
    await entrance.waitFor({ state: "visible" });
    if (dismissal === "Escape") {
      await page.keyboard.press("Escape");
    } else {
      await entrance.click({ position: { x: 8, y: 8 } });
    }
    await entrance.waitFor({ state: "detached", timeout: 500 });
    record(`early-dismissal:${dismissal}`, true);
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({ screenshots: outputDir }));
if (failed) process.exitCode = 1;
