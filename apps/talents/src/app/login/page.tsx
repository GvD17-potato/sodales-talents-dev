import type { Metadata } from "next";
import { AuthPreviewForm } from "@/components/auth-preview-form";
import { TransitionLink } from "@/components/transition-shell";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <main id="main-content" className="min-h-[72vh] border-b border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-20">
        <div className="bg-violet-deep p-7 text-ivory sm:p-10 lg:min-h-[590px] lg:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-accessible">Talent access</p>
          <h1 className="mt-6 max-w-xl font-display text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-6xl">
            Continue shaping your public practice.
          </h1>
          <p className="mt-7 max-w-md text-sm leading-7 text-ivory/70">
            Sign in to manage your Sodales Talents profile and review its
            publication status.
          </p>
        </div>

        <section aria-labelledby="login-form-heading" className="flex items-center lg:px-14">
          <div className="w-full max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">Welcome back</p>
            <h2 id="login-form-heading" className="mt-4 font-display text-4xl font-semibold tracking-[-0.045em]">
              Sign in
            </h2>
            <AuthPreviewForm mode="login" />
            <p className="mt-7 text-sm text-graphite/70">
              New to the collective?{" "}
              <TransitionLink href="/sign-up" className="font-semibold text-violet hover:underline">
                Join as a talent
              </TransitionLink>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
