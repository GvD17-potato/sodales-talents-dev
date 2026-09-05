import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TransitionShell } from "@/components/transition-shell";
import "./globals.css";

const entranceBootstrap = `(() => {
  const root = document.documentElement;
  let mode = "skip";

  try {
    const sessionKey = "sodales-talents-session-started";
    const isFirstPageview = !window.sessionStorage.getItem(sessionKey);

    if (isFirstPageview) {
      window.sessionStorage.setItem(sessionKey, "true");

      if (window.location.pathname === "/") {
        mode = window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "reduced"
          : "standard";
      }
    }
  } catch {
    // If storage is unavailable, skip rather than risk replaying the entrance.
  }

  root.setAttribute("data-sodales-entrance", mode);

  // The Brand Aperture look-through effect needs an inverse CSS mask
  // (mask-composite/-webkit-mask-composite) to cut a symbol-shaped hole. This
  // is checked unconditionally (not just on first pageview) because the same
  // mask technique also drives the top-level route-transition overlay on
  // every navigation. Where unsupported, both fall back to the previously
  // shipped scale/opacity treatment rather than showing a broken mask.
  let apertureSupported = false;
  try {
    const supportsCss = typeof window !== "undefined" && "CSS" in window && typeof CSS.supports === "function";
    apertureSupported =
      supportsCss &&
      (CSS.supports("mask-composite", "exclude") || CSS.supports("-webkit-mask-composite", "xor")) &&
      (CSS.supports("mask-image", "url(a.png)") || CSS.supports("-webkit-mask-image", "url(a.png)"));
  } catch {
    apertureSupported = false;
  }
  root.setAttribute("data-sodales-aperture", apertureSupported ? "on" : "off");
})();`;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sodales-talents.vercel.app"),
  title: {
    default: "Sodales Talents — Independent creative talent",
    template: "%s | Sodales Talents",
  },
  description:
    "Discover curated independent designers, developers, photographers, writers, filmmakers, and musicians.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-sodales-entrance="pending" suppressHydrationWarning>
      <head>
        <script
          id="sodales-entrance-bootstrap"
          dangerouslySetInnerHTML={{ __html: entranceBootstrap }}
        />
      </head>
      <body className={`${inter.variable} ${manrope.variable} overflow-x-hidden antialiased`}>
        <TransitionShell>
          <a
            href="#main-content"
            className="fixed left-3 top-3 z-[120] -translate-y-24 bg-obsidian px-4 py-3 text-sm font-semibold text-ivory focus:translate-y-0"
          >
            Skip to content
          </a>
          <SiteHeader />
          {children}
          <SiteFooter />
          <Toaster richColors position="top-right" />
        </TransitionShell>
      </body>
    </html>
  );
}
