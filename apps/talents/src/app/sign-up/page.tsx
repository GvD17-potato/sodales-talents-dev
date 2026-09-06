import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { TransitionLink } from "@/components/transition-shell";
import { destinationForRole } from "@/domain";
import { getCurrentUser } from "@/lib/auth/session";
import { WRAP } from "@/lib/layout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join as a talent",
  robots: { index: false },
};

export default async function SignUpPage() {
  const currentUser = await getCurrentUser();
  if (currentUser?.role && (currentUser.role === "admin" || currentUser.profileId)) {
    redirect(destinationForRole(currentUser.role));
  }

  return (
    <main id="main-content" className="min-h-[72vh] border-b border-border">
      <div className={`grid lg:grid-cols-2 ${WRAP}`}>
        <div className="bg-violet-deep p-9 text-ivory sm:p-14 lg:min-h-[740px] lg:p-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-accessible">
            Sodales / The creative collective
          </p>
          <h1 className="mt-9 max-w-md font-display text-5xl font-semibold leading-[1.1] tracking-[-0.055em] sm:text-6xl">
            Your talent. Your people.
            <br />
            <span className="text-violet-soft">Your next chapter.</span>
          </h1>
          <p className="mt-9 max-w-sm text-sm leading-[1.65] text-violet-accessible">
            Independent minds. Shared ambition.
          </p>
        </div>

        <section aria-labelledby="signup-form-heading" className="p-9 sm:p-14 lg:max-w-[650px] lg:p-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">
            Make yourself known
          </p>
          <h2 id="signup-form-heading" className="mt-4 font-display text-4xl font-semibold tracking-[-0.045em]">
            Join as a talent.
          </h2>
          <p className="mt-3 text-[15px] text-graphite">Create your space in the collective.</p>
          <AuthForm mode="sign-up" />
          <p className="mt-7 text-sm text-graphite/70">
            Already part of the collective?{" "}
            <TransitionLink href="/login" className="text-violet underline">
              Log in
            </TransitionLink>
          </p>
        </section>
      </div>
    </main>
  );
}
