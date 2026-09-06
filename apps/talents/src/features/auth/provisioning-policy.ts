import {
  createProfileSlugBase,
  createProfileSlugCandidate,
} from "@/domain";
import type { AuthIdentity } from "./workflows";

export function applicationDisplayName(identity: AuthIdentity) {
  const supplied = identity.name?.trim();
  if (supplied && supplied.length >= 2) return supplied.slice(0, 80);

  const emailName = identity.email.split("@")[0]?.trim();
  if (emailName && emailName.length >= 2) return emailName.slice(0, 80);

  return "New Talent";
}
export function initialDraftProfileValues(
  identity: AuthIdentity,
  slugAttempt = 0,
) {
  const displayName = applicationDisplayName(identity);
  return {
    userId: identity.id,
    displayName,
    slug: createProfileSlugCandidate(
      createProfileSlugBase(displayName),
      slugAttempt,
    ),
    headline: null,
    bio: null,
    location: null,
    categoryId: null,
    status: "draft" as const,
  };
}
