import type { Metadata } from "next";
import Link from "next/link";
import { LogoutForm } from "@/components/logout-form";
import { requireRole } from "@/lib/auth/session";
import { WRAP } from "@/lib/layout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

const adminNavigation = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/talents", label: "Talents" },
  { href: "/admin/inquiries", label: "Inquiries" },
];

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const currentUser = await requireRole("admin");

  return (
    <main id="main-content" className={`min-h-[72vh] py-10 sm:py-14 ${WRAP}`}>
      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="border-b border-border pb-7 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">
            Sodales admin
          </p>
          <p className="mt-3 break-all text-sm text-graphite">{currentUser.email}</p>
          <nav aria-label="Admin navigation" className="mt-7 flex flex-wrap gap-x-5 gap-y-3 lg:flex-col">
            {adminNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-graphite hover:text-violet">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-7">
            <LogoutForm />
          </div>
        </aside>
        <div>{children}</div>
      </div>
    </main>
  );
}
