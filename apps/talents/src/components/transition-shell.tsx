"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const TOP_LEVEL_ROUTES = new Set(["/", "/talents", "/login", "/sign-up"]);
type EntranceMode = "standard" | "reduced";

type NavigationContextValue = {
  navigate: (href: string) => void;
  reducedMotion: boolean;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function TransitionShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [entranceMounted, setEntranceMounted] = useState(true);
  const [entranceMode, setEntranceMode] = useState<EntranceMode | null>(null);
  const [routeActive, setRouteActive] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const completeEntrance = useCallback(() => {
    document.documentElement.setAttribute(
      "data-sodales-entrance",
      "complete",
    );
    setEntranceMounted(false);
    setEntranceMode(null);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const mode = document.documentElement.getAttribute(
      "data-sodales-entrance",
    );
    if (mode === "standard" || mode === "reduced") {
      setEntranceMode(mode);
      return;
    }

    setEntranceMounted(false);
  }, []);

  useEffect(() => {
    if (!entranceMode) return;
    const timeout = window.setTimeout(
      completeEntrance,
      entranceMode === "reduced" ? 700 : 1900,
    );
    return () => window.clearTimeout(timeout);
  }, [completeEntrance, entranceMode]);

  useEffect(() => {
    if (!entranceMode) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") completeEntrance();
    };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [completeEntrance, entranceMode]);

  useEffect(() => {
    if (!routeActive) return;
    const timeout = window.setTimeout(() => setRouteActive(false), 260);
    return () => window.clearTimeout(timeout);
  }, [pathname, routeActive]);

  useEffect(
    () => () => {
      if (navigationTimer.current) clearTimeout(navigationTimer.current);
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
      setRouteActive(true);
      navigationTimer.current = setTimeout(() => router.push(href), 190);
    },
    [pathname, reducedMotion, router],
  );

  return (
    <NavigationContext.Provider value={{ navigate, reducedMotion }}>
      {entranceMounted ? (
        <button
          type="button"
          aria-label="Dismiss introduction"
          onAnimationEnd={(event) => {
            if (event.currentTarget === event.target) completeEntrance();
          }}
          onClick={completeEntrance}
          className="brand-entrance"
        >
          <span className="brand-entrance__asset" aria-hidden="true">
            <Image
              src="/media/sodales-symbol.png"
              alt=""
              width={203}
              height={203}
              priority
            />
          </span>
        </button>
      ) : null}

      {children}

      <div
        aria-hidden="true"
        className={`route-transition ${routeActive ? "route-transition--active" : ""}`}
      >
        <span className="route-transition__asset">
          <Image
            src="/media/sodales-symbol.png"
            alt=""
            width={203}
            height={203}
          />
        </span>
      </div>
    </NavigationContext.Provider>
  );
}

type TransitionLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & {
  href: string;
};

export function TransitionLink({
  href,
  onClick,
  children,
  ...props
}: TransitionLinkProps) {
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
