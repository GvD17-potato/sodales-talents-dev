"use client";

import { Button } from "@sodales/ui/button";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import type { ProfileStatus } from "@/domain";
import { initialProfileActionState } from "@/features/talents/profile-action-state";
import { submitTalentProfileAction } from "@/features/talents/profile-actions";

export function ProfileReviewAction({
  status,
  publicationComplete,
}: {
  status: ProfileStatus;
  publicationComplete: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    submitTalentProfileAction,
    initialProfileActionState,
  );
  const currentStatus = state.profileStatus ?? status;
  const canSubmit = currentStatus === "draft" || currentStatus === "hidden";
  const label = currentStatus === "hidden" ? "Resubmit for review" : "Submit for review";

  useEffect(() => {
    if (state.status === "success" && state.message) toast.success(state.message);
    if (state.status === "error" && state.message) toast.error(state.message);
  }, [state]);

  if (!canSubmit) {
    return (
      <p className="text-sm leading-6 text-graphite">
        {currentStatus === "pending"
          ? "Your profile is currently with the moderation team."
          : "Your approved profile is live. Material edits will return it to review."}
      </p>
    );
  }

  return (
    <form action={formAction}>
      <Button type="submit" disabled={!publicationComplete || pending} aria-busy={pending}>
        {pending ? "Submitting…" : label}
      </Button>
      {!publicationComplete ? (
        <p className="mt-3 text-sm leading-6 text-graphite">Complete every required item before submitting.</p>
      ) : null}
      {state.message ? (
        <p role={state.status === "error" ? "alert" : "status"} className={`mt-3 text-sm ${state.status === "error" ? "text-red-700" : "text-graphite"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
