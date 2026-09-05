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

const SESSION_STARTED_KEY = "sodales-talents-session-started";
const TOP_LEVEL_ROUTES = new Set(["/", "/talents", "/login", "/sign-up"]);

type NavigationContextValue = {
  navigate: (href: string) => void;
  reducedMotion: boolean;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function TransitionShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const initialized = useRef(false);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [entranceActive, setEntranceActive] = useState(false);
  const [routeActive, setRouteActive] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const sessionStarted = window.sessionStorage.getItem(SESSION_STARTED_KEY);
    if (sessionStarted) return;

    window.sessionStorage.setItem(SESSION_STARTED_KEY, "true");
    if (pathname !== "/") return;

    setEntranceActive(true);
  }, [pathname]);

  useEffect(() => {
    if (!entranceActive) return;
    const timeout = window.setTimeout(
      () => setEntranceActive(false),
      reducedMotion ? 360 : 1320,
    );
    return () => window.clearTimeout(timeout);
  }, [entranceActive, reducedMotion]);

  useEffect(() => {
    if (!entranceActive) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEntranceActive(false);
    };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [entranceActive]);

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
      {children}

      {entranceActive ? (
        <button
          type="button"
          aria-label="Dismiss introduction"
          onClick={() => setEntranceActive(false)}
          className={`brand-entrance ${reducedMotion ? "brand-entrance--reduced" : ""}`}
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
