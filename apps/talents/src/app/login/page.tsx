import type { Metadata } from "next";
import { AuthPreviewForm } from "@/components/auth-preview-form";
import { TransitionLink } from "@/components/transition-shell";
import { WRAP } from "@/lib/layout";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <main id="main-content" className="min-h-[72vh] border-b border-border">
      <div className={`grid lg:grid-cols-2 ${WRAP}`}>
        <div className="bg-violet-deep p-9 text-ivory sm:p-14 lg:min-h-[740px] lg:p-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-accessible">
            Sodales / The creative collective
          </p>
          <h1 className="mt-9 max-w-md font-display text-5xl font-semibold leading-[1.1] tracking-[-0.055em] sm:text-6xl">
            Continue shaping your public{" "}
            <span className="text-violet-soft">practice.</span>
          </h1>
          <p className="mt-9 max-w-sm text-sm leading-[1.65] text-violet-accessible">
            Independent minds. Shared ambition.
          </p>
        </div>

        <section aria-labelledby="login-form-heading" className="p-9 sm:p-14 lg:max-w-[650px] lg:p-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">
            Good to have you back
          </p>
          <h2 id="login-form-heading" className="mt-4 font-display text-4xl font-semibold tracking-[-0.045em]">
            Welcome back.
          </h2>
          <p className="mt-3 text-[15px] text-graphite">Step into your creative workspace.</p>
          <AuthPreviewForm mode="login" />
          <p className="mt-7 text-sm text-graphite/70">
            New to Sodales?{" "}
            <TransitionLink href="/sign-up" className="text-violet underline">
              Join as a talent
            </TransitionLink>
          </p>
        </section>
      </div>
    </main>
  );
}
