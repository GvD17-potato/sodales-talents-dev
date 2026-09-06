import type { Metadata } from "next";
import Link from "next/link";
import { LogoutForm } from "@/components/logout-form";
import { requireRole } from "@/lib/auth/session";
import { WRAP } from "@/lib/layout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const currentUser = await requireRole("talent", "admin");

  return (
    <main id="main-content" className={`min-h-[72vh] py-10 sm:py-14 ${WRAP}`}>
      <div className="mb-10 flex flex-col justify-between gap-5 border-b border-border pb-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">
            Private workspace
          </p>
          <p className="mt-2 text-sm text-graphite">{currentUser.email}</p>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/dashboard" className="text-sm text-graphite hover:text-violet">
            Overview
          </Link>
          {currentUser.role === "talent" ? (
            <Link href="/dashboard/profile" className="text-sm text-graphite hover:text-violet">
              Profile
            </Link>
          ) : null}
          <LogoutForm />
        </div>
      </div>
      {children}
    </main>
  );
}
