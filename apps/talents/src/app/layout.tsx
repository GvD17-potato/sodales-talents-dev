import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TransitionShell } from "@/components/transition-shell";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
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
