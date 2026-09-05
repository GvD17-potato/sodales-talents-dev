"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CanvasEntrance } from "./canvas-entrance";

const TOP_LEVEL_ROUTES = new Set(["/", "/talents", "/login", "/sign-up"]);
type EntranceMode = "standard" | "reduced";

const ROUTE_SYMBOL_SIZE = 76;
const APERTURE_MARGIN = 1.2;
const APERTURE_MIN_SCALE = 4;

const REDUCED_TIMEOUT_MS = 700;
const ROUTE_NAVIGATE_DELAY_MS = 150;
const ROUTE_TOTAL_MS = 650;

type NavigationContextValue = {
  navigate: (href: string) => void;
  reducedMotion: boolean;
  replay: () => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

function computeApertureScale(baseSizePx: number) {
  if (typeof window === "undefined") return APERTURE_MIN_SCALE;
  const diagonal = Math.hypot(window.innerWidth, window.innerHeight);
  return Math.max(APERTURE_MIN_SCALE, (diagonal * APERTURE_MARGIN) / baseSizePx);
}

export function TransitionShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const routeCompleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [entranceMounted, setEntranceMounted] = useState(true);
  const [entranceMode, setEntranceMode] = useState<EntranceMode | null>(null);
  const [entranceRunId, setEntranceRunId] = useState(0);
  const [apertureSupported, setApertureSupported] = useState(false);
  const [routeActive, setRouteActive] = useState(false);
  const [routeScale, setRouteScale] = useState(APERTURE_MIN_SCALE);
  const [routeKey, setRouteKey] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const completeEntrance = useCallback(() => {
    document.documentElement.setAttribute("data-sodales-entrance", "complete");
    document.documentElement.setAttribute("data-sodales-canvas", "inactive");
    setEntranceMounted(false);
    setEntranceMode(null);
  }, []);

  const canvasReady = useCallback(() => {
    document.documentElement.setAttribute("data-sodales-canvas", "ready");
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const mode = document.documentElement.getAttribute("data-sodales-entrance");
    setApertureSupported(
      document.documentElement.getAttribute("data-sodales-aperture") === "on",
    );

    if (mode === "standard" || mode === "reduced") {
      setEntranceMode(mode);
      return;
    }

    setEntranceMounted(false);
  }, []);

  // Only the reduced-motion path (a short CSS opacity dissolve) is driven
  // from here. The standard/Canvas entrance owns its own watchdog timeout
  // and Escape handling internally (see canvas-entrance.tsx), matching the
  // Astra reference's self-contained lifecycle.
  useEffect(() => {
    if (entranceMode !== "reduced") return;
    const timeout = window.setTimeout(completeEntrance, REDUCED_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [completeEntrance, entranceMode]);

  useEffect(() => {
    if (entranceMode !== "reduced") return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") completeEntrance();
    };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [completeEntrance, entranceMode]);

  useEffect(
    () => () => {
      if (navigationTimer.current) clearTimeout(navigationTimer.current);
      if (routeCompleteTimer.current) clearTimeout(routeCompleteTimer.current);
    },
    [],
  );

  const navigate = useCallback(
    (href: string) => {
      if (
        reducedMotion ||
        !TOP_LEVEL_ROUTES.has(pathname) ||
        !TOP_LEVEL_ROUTES.has(href) ||
        pathname === href
      ) {
        router.push(href);
        return;
      }

      if (navigationTimer.current) clearTimeout(navigationTimer.current);
      if (routeCompleteTimer.current) clearTimeout(routeCompleteTimer.current);

      // A fresh key forces React to remount the overlay, guaranteeing its CSS
      // animation restarts from frame zero even if a previous top-level
      // transition was still mid-flight — this is what makes "latest
      // navigation wins" actually replay cleanly instead of resuming a
      // stale, already-progressed animation.
      setRouteKey((key) => key + 1);
      setRouteScale(computeApertureScale(ROUTE_SYMBOL_SIZE));
      setRouteActive(true);

      navigationTimer.current = setTimeout(() => router.push(href), ROUTE_NAVIGATE_DELAY_MS);
      routeCompleteTimer.current = setTimeout(() => setRouteActive(false), ROUTE_TOTAL_MS);
    },
    [pathname, reducedMotion, router],
  );

  // Footer "Replay entrance" — mirrors the Astra reference's `replay()`:
  // jump home, reset scroll, and re-run the entrance, bypassing the
  // once-per-session gate. Still respects reduced motion (the reduced,
  // non-canvas path plays instead of the full Canvas flight), exactly as
  // Astra's own replay does by re-entering the same mode check on mount.
  const replay = useCallback(() => {
    if (pathname !== "/") router.push("/");
    window.scrollTo({ top: 0, behavior: "instant" });
    document.documentElement.setAttribute(
      "data-sodales-entrance",
      reducedMotion ? "reduced" : "standard",
    );
    document.documentElement.setAttribute(
      "data-sodales-canvas",
      reducedMotion ? "inactive" : "pending",
    );
    setEntranceMode(reducedMotion ? "reduced" : "standard");
    setEntranceMounted(true);
    setEntranceRunId((id) => id + 1);
  }, [pathname, reducedMotion, router]);

  const reducedAnimationEnd = (event: React.AnimationEvent<HTMLButtonElement>) => {
    if (event.currentTarget === event.target) completeEntrance();
  };

  return (
    <NavigationContext.Provider value={{ navigate, reducedMotion, replay }}>
      {entranceMounted && entranceMode !== "standard" ? (
        // Rendered unconditionally (not gated on `entranceMode`, which only
        // resolves post-hydration) so this element already exists in the DOM
        // at first paint — the same no-flash mechanism as before. Once
        // `entranceMode` resolves to "standard" this is hidden by CSS
        // (see the `[data-sodales-entrance="pending"]` / `="reduced"` rules
        // in globals.css) and the Canvas entrance below takes over instead.
        <button
          type="button"
          aria-label="Dismiss introduction"
          onAnimationEnd={reducedAnimationEnd}
          onClick={completeEntrance}
          className="brand-entrance"
        >
          <span className="brand-entrance__asset" aria-hidden="true">
            <Image
              src="/media/sodales-symbol-transparent.png"
              alt=""
              width={203}
              height={203}
              priority
            />
          </span>
        </button>
      ) : null}

      {entranceMounted && entranceMode === "standard" ? (
        <CanvasEntrance
          run={entranceRunId}
          onReady={canvasReady}
          onDone={completeEntrance}
        />
      ) : null}

      {children}

      {apertureSupported ? (
        <div
          key={routeKey}
          aria-hidden="true"
          className={`route-aperture ${routeActive ? "route-aperture--active" : ""}`}
          style={{ "--aperture-route-scale-end": routeScale } as CSSProperties}
        >
          <span className="route-aperture__hole" />
          <span className="route-aperture__plug" />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className={`route-transition ${routeActive ? "route-transition--active" : ""}`}
        >
          <span className="route-transition__asset">
            <Image src="/media/sodales-symbol-transparent.png" alt="" width={203} height={203} />
          </span>
        </div>
      )}
    </NavigationContext.Provider>
  );
}

export function useEntranceReplay() {
  const context = useContext(NavigationContext);
  if (!context) throw new Error("useEntranceReplay must be used within TransitionShell");
  return context.replay;
}

type TransitionLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
};

export function TransitionLink({ href, onClick, children, ...props }: TransitionLinkProps) {
  const context = useContext(NavigationContext);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      props.target === "_blank"
    ) {
      return;
    }

    event.preventDefault();
    context?.navigate(href);
  }

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
