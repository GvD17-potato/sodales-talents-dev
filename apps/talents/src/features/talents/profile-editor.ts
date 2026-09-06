import "server-only";

import { and, asc, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  talentCategory,
  talentPortfolioLink,
  talentProfile,
  talentSkill,
} from "@/db/schema";
import {
  classifyProfileChanges,
  draftProfileSchema,
  getProfileStatusAfterSave,
  transitionProfileStatus,
  validatePublicationCompleteness,
  type DraftProfile,
  type ProfileChangeClassification,
  type ProfileStatus,
} from "@/domain";

const authUserIdSchema = z.uuid();

export type EditableTalentCategory = {
  id: string;
  slug: string;
  name: string;
};

export type PublicationRequirement = {
  key:
    | "displayName"
    | "slug"
    | "headline"
    | "bio"
    | "location"
    | "categoryId"
    | "skills"
    | "links";
  label: string;
  complete: boolean;
};

export type TalentProfileWorkspace = {
  values: DraftProfile;
  status: ProfileStatus;
  categoryName: string | null;
  publicationComplete: boolean;
  requirements: PublicationRequirement[];
};

type ValidationIssue = {
  path: PropertyKey[];
  message: string;
};

export type ProfileSaveResult =
  | {
      ok: true;
      status: ProfileStatus;
      classification: ProfileChangeClassification;
      previousSlug: string;
      slug: string;
    }
  | {
      ok: false;
      reason:
        | "validation"
        | "profile-not-found"
        | "slug-taken"
        | "category-not-found"
        | "unexpected";
      issues?: ValidationIssue[];
    };

export type ProfileReviewResult =
  | { ok: true; status: "pending"; slug: string }
  | {
      ok: false;
      reason:
        | "publication-incomplete"
        | "transition-not-allowed"
        | "profile-not-found"
        | "unexpected";
      status?: ProfileStatus;
      issues?: ValidationIssue[];
    };

const publicationRequirements: Array<{
  key: PublicationRequirement["key"];
  label: string;
}> = [
  { key: "displayName", label: "Display name" },
  { key: "slug", label: "Public profile slug" },
  { key: "headline", label: "Headline" },
  { key: "bio", label: "Biography" },
  { key: "location", label: "Location" },
  { key: "categoryId", label: "Category" },
  { key: "skills", label: "At least one skill" },
  { key: "links", label: "Portfolio links valid when supplied" },
];

function databaseErrorCode(error: unknown) {
  return typeof error === "object" && error && "code" in error
    ? String(error.code)
    : "UNKNOWN";
}

function logUnexpectedDatabaseError(operation: string, error: unknown) {
  console.error("Talent profile operation failed.", {
    operation,
    code: databaseErrorCode(error),
  });
}

function validUserId(rawUserId: string) {
  return authUserIdSchema.safeParse(rawUserId);
}

function profileValues(
  profile: {
    displayName: string;
    slug: string;
    headline: string | null;
    bio: string | null;
    location: string | null;
    categoryId: string | null;
  },
  skills: string[],
  links: Array<{ label: string; url: string }>,
): DraftProfile {
  return {
    displayName: profile.displayName,
    slug: profile.slug,
    headline: profile.headline,
    bio: profile.bio,
    location: profile.location,
    categoryId: profile.categoryId,
    skills,
    links,
  };
}

function publicationState(values: DraftProfile, categoryExists: boolean) {
  const result = validatePublicationCompleteness(values, { categoryExists });
  const incompleteFields = new Set(
    result.success
      ? []
      : result.error.issues.map((issue) => String(issue.path[0])),
  );
  return {
    publicationComplete: result.success,
    requirements: publicationRequirements.map((requirement) => ({
      ...requirement,
      complete: !incompleteFields.has(requirement.key),
    })),
  };
}

export async function listEditableTalentCategories(): Promise<
  EditableTalentCategory[]
> {
  try {
    return await db
      .select({
        id: talentCategory.id,
        slug: talentCategory.slug,
        name: talentCategory.name,
      })
      .from(talentCategory)
      .orderBy(asc(talentCategory.name), asc(talentCategory.id));
  } catch (error) {
    logUnexpectedDatabaseError("list editable categories", error);
    throw new Error("Profile categories are temporarily unavailable.");
  }
}

export async function getTalentProfileWorkspace(
  rawUserId: string,
): Promise<TalentProfileWorkspace | null> {
  const parsedUserId = validUserId(rawUserId);
  if (!parsedUserId.success) return null;

  try {
    const [profile] = await db
      .select({
        id: talentProfile.id,
        displayName: talentProfile.displayName,
        slug: talentProfile.slug,
        headline: talentProfile.headline,
        bio: talentProfile.bio,
        location: talentProfile.location,
        categoryId: talentProfile.categoryId,
        status: talentProfile.status,
        categoryName: talentCategory.name,
      })
      .from(talentProfile)
      .leftJoin(
        talentCategory,
        eq(talentProfile.categoryId, talentCategory.id),
      )
      .where(eq(talentProfile.userId, parsedUserId.data))
      .limit(1);
    if (!profile) return null;

    const [skillRows, linkRows] = await Promise.all([
      db
        .select({ name: talentSkill.name })
        .from(talentSkill)
        .where(eq(talentSkill.profileId, profile.id))
        .orderBy(asc(talentSkill.position), asc(talentSkill.id)),
      db
        .select({
          label: talentPortfolioLink.label,
          url: talentPortfolioLink.url,
        })
        .from(talentPortfolioLink)
        .where(eq(talentPortfolioLink.profileId, profile.id))
        .orderBy(
          asc(talentPortfolioLink.position),
          asc(talentPortfolioLink.id),
        ),
    ]);
    const values = profileValues(
      profile,
      skillRows.map((skill) => skill.name),
      linkRows,
    );

    return {
      values,
      status: profile.status,
      categoryName: profile.categoryName,
      ...publicationState(values, profile.categoryName !== null),
    };
  } catch (error) {
    logUnexpectedDatabaseError("load talent workspace", error);
    throw new Error("Your profile is temporarily unavailable.");
  }
}

export async function saveTalentProfileForUser(
  rawUserId: string,
  input: unknown,
): Promise<ProfileSaveResult> {
  const parsedUserId = validUserId(rawUserId);
  const parsedInput = draftProfileSchema.safeParse(input);
  if (!parsedInput.success) {
    return {
      ok: false,
      reason: "validation",
      issues: parsedInput.error.issues,
    };
  }
  if (!parsedUserId.success) return { ok: false, reason: "profile-not-found" };

  try {
    return await db.transaction(async (transaction) => {
      const [profile] = await transaction
        .select({
          id: talentProfile.id,
          displayName: talentProfile.displayName,
          slug: talentProfile.slug,
          headline: talentProfile.headline,
          bio: talentProfile.bio,
          location: talentProfile.location,
          categoryId: talentProfile.categoryId,
          status: talentProfile.status,
        })
        .from(talentProfile)
        .where(eq(talentProfile.userId, parsedUserId.data))
        .limit(1)
        .for("update");
      if (!profile) return { ok: false, reason: "profile-not-found" } as const;

      if (parsedInput.data.categoryId) {
        const [category] = await transaction
          .select({ id: talentCategory.id })
          .from(talentCategory)
          .where(eq(talentCategory.id, parsedInput.data.categoryId))
          .limit(1);
        if (!category) {
          return { ok: false, reason: "category-not-found" } as const;
        }
      }

      const [slugOwner] = await transaction
        .select({ id: talentProfile.id })
        .from(talentProfile)
        .where(
          and(
            eq(talentProfile.slug, parsedInput.data.slug),
            ne(talentProfile.id, profile.id),
          ),
        )
        .limit(1);
      if (slugOwner) return { ok: false, reason: "slug-taken" } as const;

      const [skillRows, linkRows] = await Promise.all([
        transaction
          .select({ name: talentSkill.name })
          .from(talentSkill)
          .where(eq(talentSkill.profileId, profile.id))
          .orderBy(asc(talentSkill.position), asc(talentSkill.id)),
        transaction
          .select({
            label: talentPortfolioLink.label,
            url: talentPortfolioLink.url,
          })
          .from(talentPortfolioLink)
          .where(eq(talentPortfolioLink.profileId, profile.id))
          .orderBy(
            asc(talentPortfolioLink.position),
            asc(talentPortfolioLink.id),
          ),
      ]);
      const persisted = profileValues(
        profile,
        skillRows.map((skill) => skill.name),
        linkRows,
      );
      const change = classifyProfileChanges({
        ...persisted,
        portfolioLinks: persisted.links,
      }, {
        ...parsedInput.data,
        portfolioLinks: parsedInput.data.links,
      });
      if (change.classification === "no-op") {
        return {
          ok: true,
          status: profile.status,
          classification: change.classification,
          previousSlug: profile.slug,
          slug: profile.slug,
        } as const;
      }

      const nextStatus = getProfileStatusAfterSave(
        profile.status,
        change.classification,
      );
      const [updated] = await transaction
        .update(talentProfile)
        .set({
          displayName: parsedInput.data.displayName,
          slug: parsedInput.data.slug,
          headline: parsedInput.data.headline,
          bio: parsedInput.data.bio,
          location: parsedInput.data.location,
          categoryId: parsedInput.data.categoryId,
          status: nextStatus,
          updatedAt: new Date(),
        })
        .where(eq(talentProfile.id, profile.id))
        .returning({ id: talentProfile.id });
      if (!updated) throw new Error("Owned profile update was not applied.");

      await transaction
        .delete(talentSkill)
        .where(eq(talentSkill.profileId, profile.id));
      if (parsedInput.data.skills.length) {
        await transaction.insert(talentSkill).values(
          parsedInput.data.skills.map((name, position) => ({
            profileId: profile.id,
            name,
            position,
          })),
        );
      }

      await transaction
        .delete(talentPortfolioLink)
        .where(eq(talentPortfolioLink.profileId, profile.id));
      if (parsedInput.data.links.length) {
        await transaction.insert(talentPortfolioLink).values(
          parsedInput.data.links.map((link, position) => ({
            profileId: profile.id,
            label: link.label,
            url: link.url,
            position,
          })),
        );
      }

      return {
        ok: true,
        status: nextStatus,
        classification: change.classification,
        previousSlug: profile.slug,
        slug: parsedInput.data.slug,
      } as const;
    });
  } catch (error) {
    const code = databaseErrorCode(error);
    if (code === "23505") return { ok: false, reason: "slug-taken" };
    if (code === "23503") return { ok: false, reason: "category-not-found" };
    logUnexpectedDatabaseError("save owned profile", error);
    return { ok: false, reason: "unexpected" };
  }
}

export async function submitTalentProfileForReview(
  rawUserId: string,
): Promise<ProfileReviewResult> {
  const parsedUserId = validUserId(rawUserId);
  if (!parsedUserId.success) return { ok: false, reason: "profile-not-found" };

  try {
    return await db.transaction(async (transaction) => {
      const [profile] = await transaction
        .select({
          id: talentProfile.id,
          displayName: talentProfile.displayName,
          slug: talentProfile.slug,
          headline: talentProfile.headline,
          bio: talentProfile.bio,
          location: talentProfile.location,
          categoryId: talentProfile.categoryId,
          status: talentProfile.status,
        })
        .from(talentProfile)
        .where(eq(talentProfile.userId, parsedUserId.data))
        .limit(1)
        .for("update");
      if (!profile) return { ok: false, reason: "profile-not-found" } as const;

      const event =
        profile.status === "draft"
          ? "submit"
          : profile.status === "hidden"
            ? "resubmit"
            : null;
      if (!event) {
        return {
          ok: false,
          reason: "transition-not-allowed",
          status: profile.status,
        } as const;
      }

      const [skillRows, linkRows, categoryRows] = await Promise.all([
        transaction
          .select({ name: talentSkill.name })
          .from(talentSkill)
          .where(eq(talentSkill.profileId, profile.id))
          .orderBy(asc(talentSkill.position), asc(talentSkill.id)),
        transaction
          .select({
            label: talentPortfolioLink.label,
            url: talentPortfolioLink.url,
          })
          .from(talentPortfolioLink)
          .where(eq(talentPortfolioLink.profileId, profile.id))
          .orderBy(
            asc(talentPortfolioLink.position),
            asc(talentPortfolioLink.id),
          ),
        profile.categoryId
          ? transaction
              .select({ id: talentCategory.id })
              .from(talentCategory)
              .where(eq(talentCategory.id, profile.categoryId))
              .limit(1)
          : Promise.resolve([]),
      ]);
      const values = profileValues(
        profile,
        skillRows.map((skill) => skill.name),
        linkRows,
      );
      const completeness = validatePublicationCompleteness(values, {
        categoryExists: categoryRows.length === 1,
      });
      if (!completeness.success) {
        return {
          ok: false,
          reason: "publication-incomplete",
          status: profile.status,
          issues: completeness.error.issues,
        } as const;
      }

      const transition = transitionProfileStatus(profile.status, event, true);
      if (!transition.ok || transition.status !== "pending") {
        return {
          ok: false,
          reason: "transition-not-allowed",
          status: profile.status,
        } as const;
      }
      const [updated] = await transaction
        .update(talentProfile)
        .set({ status: transition.status, updatedAt: new Date() })
        .where(eq(talentProfile.id, profile.id))
        .returning({ id: talentProfile.id });
      if (!updated) throw new Error("Profile submission was not applied.");

      return {
        ok: true,
        status: transition.status,
        slug: profile.slug,
      } as const;
    });
  } catch (error) {
    logUnexpectedDatabaseError("submit owned profile", error);
    return { ok: false, reason: "unexpected" };
  }
}
