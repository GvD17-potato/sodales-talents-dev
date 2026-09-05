import type { ProfileStatus } from "./constants";
import type { ProfileChangeClassification } from "./profile-materiality";

export type ProfileTransitionEvent = "submit" | "approve" | "hide" | "resubmit";

type ProfileTransitionResult =
  | { ok: true; status: ProfileStatus }
  | {
      ok: false;
      status: ProfileStatus;
      reason: "publication-incomplete" | "transition-not-allowed";
    };

const PROFILE_TRANSITIONS: Partial<
  Record<ProfileStatus, Partial<Record<ProfileTransitionEvent, ProfileStatus>>>
> = {
  draft: { submit: "pending" },
  pending: { approve: "approved", hide: "hidden" },
  approved: { hide: "hidden" },
  hidden: { resubmit: "pending" },
};

const COMPLETENESS_GATED_EVENTS = new Set<ProfileTransitionEvent>([
  "submit",
  "approve",
  "resubmit",
]);

export function transitionProfileStatus(
  current: ProfileStatus,
  event: ProfileTransitionEvent,
  publicationComplete: boolean,
): ProfileTransitionResult {
  const next = PROFILE_TRANSITIONS[current]?.[event];
  if (!next) {
    return { ok: false, status: current, reason: "transition-not-allowed" };
  }

  if (COMPLETENESS_GATED_EVENTS.has(event) && !publicationComplete) {
    return { ok: false, status: current, reason: "publication-incomplete" };
  }

  return { ok: true, status: next };
}

export function getProfileStatusAfterSave(
  current: ProfileStatus,
  change: ProfileChangeClassification,
): ProfileStatus {
  if (current === "pending" && change !== "no-op") return "draft";
  if (current === "approved" && change === "material") return "pending";
  return current;
}
