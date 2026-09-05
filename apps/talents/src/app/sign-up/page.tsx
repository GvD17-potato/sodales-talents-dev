import type { Metadata } from "next";
import { AuthPreviewForm } from "@/components/auth-preview-form";
import { TransitionLink } from "@/components/transition-shell";

export const metadata: Metadata = {
  title: "Join as a talent",
  robots: { index: false },
};

export default function SignUpPage() {
  return (
    <main id="main-content" className="min-h-[72vh] border-b border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-20">
        <div className="bg-violet-deep p-7 text-ivory sm:p-10 lg:min-h-[640px] lg:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-accessible">Join the collective</p>
          <h1 className="mt-6 max-w-xl font-display text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-6xl">
            Put thoughtful work in front of ambitious teams.
          </h1>
          <p className="mt-7 max-w-md text-sm leading-7 text-ivory/70">
            Create a private draft profile, shape it at your pace, and submit
            it for Sodales review when it is complete.
          </p>
        </div>

        <section aria-labelledby="signup-form-heading" className="flex items-center lg:px-14">
          <div className="w-full max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet">Talent profile</p>
            <h2 id="signup-form-heading" className="mt-4 font-display text-4xl font-semibold tracking-[-0.045em]">
              Create your account
            </h2>
            <AuthPreviewForm mode="sign-up" />
            <p className="mt-7 text-sm text-graphite/70">
              Already have an account?{" "}
              <TransitionLink href="/login" className="font-semibold text-violet hover:underline">
                Sign in
              </TransitionLink>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
