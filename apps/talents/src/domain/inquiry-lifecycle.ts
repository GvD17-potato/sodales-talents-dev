import type { InquiryStatus } from "./constants";

type InquiryTransitionResult =
  | { ok: true; status: InquiryStatus }
  | {
      ok: false;
      status: InquiryStatus;
      reason: "transition-not-allowed";
    };

const ALLOWED_INQUIRY_TRANSITIONS: Record<
  InquiryStatus,
  ReadonlySet<InquiryStatus>
> = {
  new: new Set(["read", "archived"]),
  read: new Set(["new", "archived"]),
  archived: new Set(["read"]),
};

export function transitionInquiryStatus(
  current: InquiryStatus,
  next: InquiryStatus,
): InquiryTransitionResult {
  if (!ALLOWED_INQUIRY_TRANSITIONS[current].has(next)) {
    return { ok: false, status: current, reason: "transition-not-allowed" };
  }

  return { ok: true, status: next };
}
