import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  ilike,
  inArray,
  isNotNull,
  or,
  sql,
} from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import {
  talentCategory,
  talentPortfolioLink,
  talentProfile,
  talentSkill,
} from "@/db/schema";
import type { PublicTalent, TalentCategory, TalentFilters } from "./types";

const maximumPublicResultLimit = 100;

function publicProfileBoundary() {
  return and(
    eq(talentProfile.status, "approved"),
    isNotNull(talentProfile.headline),
    isNotNull(talentProfile.bio),
    isNotNull(talentProfile.location),
    isNotNull(talentProfile.categoryId),
    exists(
      db
        .select({ value: sql<number>`1` })
        .from(talentSkill)
        .where(eq(talentSkill.profileId, talentProfile.id)),
    ),
  );
}

function normalizeQuery(value: string | undefined) {
  return value?.trim() ?? "";
}

function normalizeCategory(value: string | undefined) {
  return value?.trim().toLocaleLowerCase() ?? "";
}

function escapedContainsPattern(value: string) {
  return `%${value.replace(/[\\%_]/g, "\\$&")}%`;
}

function normalizedLimit(value: number | undefined) {
  if (value === undefined) return undefined;
  if (!Number.isSafeInteger(value) || value < 1) return undefined;
  return Math.min(value, maximumPublicResultLimit);
}

function safeDatabaseError(operation: string, error: unknown): never {
  const code =
    typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "UNKNOWN";
  console.error("Public talent query failed.", { operation, code });
  throw new Error("Public talent data is temporarily unavailable.");
}

async function resolveCategoryId(slug: string) {
  if (!slug) return undefined;
  const [category] = await db
    .select({ id: talentCategory.id })
    .from(talentCategory)
    .where(eq(talentCategory.slug, slug))
    .limit(1);
  return category?.id;
}

const publicProfileSelection = {
  id: talentProfile.id,
  slug: talentProfile.slug,
  displayName: talentProfile.displayName,
  headline: talentProfile.headline,
  bio: talentProfile.bio,
  location: talentProfile.location,
  createdAt: talentProfile.createdAt,
  categoryId: talentCategory.id,
  categorySlug: talentCategory.slug,
  categoryName: talentCategory.name,
  categoryDescription: talentCategory.description,
};

type PublicProfileRow = {
  id: string;
  slug: string;
  displayName: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  createdAt: Date;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  categoryDescription: string;
};

function requiredPublicText(value: string | null) {
  if (value === null) {
    throw new Error("An approved profile violated publication completeness.");
  }
  return value;
}

async function hydratePublicProfiles(
  profileRows: PublicProfileRow[],
): Promise<PublicTalent[]> {
  if (profileRows.length === 0) return [];
  const profileIds = profileRows.map((profile) => profile.id);
  const [skillRows, linkRows] = await Promise.all([
    db
      .select({
        profileId: talentSkill.profileId,
        name: talentSkill.name,
      })
      .from(talentSkill)
      .where(inArray(talentSkill.profileId, profileIds))
      .orderBy(
        asc(talentSkill.profileId),
        asc(talentSkill.position),
        asc(talentSkill.id),
      ),
    db
      .select({
        profileId: talentPortfolioLink.profileId,
        label: talentPortfolioLink.label,
        url: talentPortfolioLink.url,
      })
      .from(talentPortfolioLink)
      .where(inArray(talentPortfolioLink.profileId, profileIds))
      .orderBy(
        asc(talentPortfolioLink.profileId),
        asc(talentPortfolioLink.position),
        asc(talentPortfolioLink.id),
      ),
  ]);

  const skillsByProfile = new Map<string, string[]>();
  for (const skill of skillRows) {
    const skills = skillsByProfile.get(skill.profileId) ?? [];
    skills.push(skill.name);
    skillsByProfile.set(skill.profileId, skills);
  }

  const linksByProfile = new Map<
    string,
    Array<{ label: string; url: string }>
  >();
  for (const link of linkRows) {
    const links = linksByProfile.get(link.profileId) ?? [];
    links.push({ label: link.label, url: link.url });
    linksByProfile.set(link.profileId, links);
  }

  return profileRows.map((profile) => ({
    id: profile.id,
    slug: profile.slug,
    displayName: profile.displayName,
    headline: requiredPublicText(profile.headline),
    bio: requiredPublicText(profile.bio),
    location: requiredPublicText(profile.location),
    category: {
      id: profile.categoryId,
      slug: profile.categorySlug,
      name: profile.categoryName,
      description: profile.categoryDescription,
    },
    skills: skillsByProfile.get(profile.id) ?? [],
    portfolioLinks: linksByProfile.get(profile.id) ?? [],
    memberSince: String(profile.createdAt.getUTCFullYear()),
  }));
}

export async function listTalentCategories(): Promise<TalentCategory[]> {
  try {
    const rows = await db
      .select({
        id: talentCategory.id,
        slug: talentCategory.slug,
        name: talentCategory.name,
        description: talentCategory.description,
        approvedTalentCount: count(talentProfile.id),
      })
      .from(talentCategory)
      .leftJoin(
        talentProfile,
        and(
          eq(talentProfile.categoryId, talentCategory.id),
          publicProfileBoundary(),
        ),
      )
      .groupBy(
        talentCategory.id,
        talentCategory.slug,
        talentCategory.name,
        talentCategory.description,
      )
      .orderBy(asc(talentCategory.name), asc(talentCategory.id));
    return rows.map((row) => ({
      ...row,
      approvedTalentCount: Number(row.approvedTalentCount),
    }));
  } catch (error) {
    safeDatabaseError("list categories", error);
  }
}

export async function listApprovedTalents(
  filters: TalentFilters = {},
): Promise<PublicTalent[]> {
  try {
    const query = normalizeQuery(filters.q);
    const requestedCategory = normalizeCategory(filters.category);
    const categoryId = await resolveCategoryId(requestedCategory);
    const categoryCondition =
      requestedCategory && categoryId
        ? eq(talentProfile.categoryId, categoryId)
        : undefined;
    const searchPattern = query ? escapedContainsPattern(query) : "";
    const searchCondition = query
      ? or(
          ilike(talentProfile.displayName, searchPattern),
          ilike(talentProfile.headline, searchPattern),
          ilike(talentProfile.bio, searchPattern),
          ilike(talentProfile.location, searchPattern),
          exists(
            db
              .select({ value: sql<number>`1` })
              .from(talentSkill)
              .where(
                and(
                  eq(talentSkill.profileId, talentProfile.id),
                  ilike(talentSkill.name, searchPattern),
                ),
              ),
          ),
        )
      : undefined;

    let statement = db
      .select(publicProfileSelection)
      .from(talentProfile)
      .innerJoin(
        talentCategory,
        eq(talentProfile.categoryId, talentCategory.id),
      )
      .where(
        and(publicProfileBoundary(), categoryCondition, searchCondition),
      )
      .orderBy(desc(talentProfile.updatedAt), asc(talentProfile.id))
      .$dynamic();
    const limit = normalizedLimit(filters.limit);
    if (limit !== undefined) statement = statement.limit(limit);

    return hydratePublicProfiles(await statement);
  } catch (error) {
    safeDatabaseError("list approved profiles", error);
  }
}

async function findApprovedTalentBySlug(
  slug: string,
): Promise<PublicTalent | null> {
  try {
    const normalizedSlug = slug.trim().toLocaleLowerCase();
    if (!normalizedSlug) return null;
    const rows = await db
      .select(publicProfileSelection)
      .from(talentProfile)
      .innerJoin(
        talentCategory,
        eq(talentProfile.categoryId, talentCategory.id),
      )
      .where(
        and(
          publicProfileBoundary(),
          eq(talentProfile.slug, normalizedSlug),
        ),
      )
      .limit(1);
    const [talent] = await hydratePublicProfiles(rows);
    return talent ?? null;
  } catch (error) {
    safeDatabaseError("get approved profile", error);
  }
}

export const getApprovedTalentBySlug = cache(findApprovedTalentBySlug);

export async function hasApprovedTalentSlug(slug: string): Promise<boolean> {
  try {
    const normalizedSlug = slug.trim().toLocaleLowerCase();
    if (!normalizedSlug) return false;
    const [profile] = await db
      .select({ id: talentProfile.id })
      .from(talentProfile)
      .where(
        and(
          publicProfileBoundary(),
          eq(talentProfile.slug, normalizedSlug),
        ),
      )
      .limit(1);
    return profile !== undefined;
  } catch (error) {
    safeDatabaseError("check approved profile visibility", error);
  }
}

export async function getPublicProofCounts() {
  try {
    const [row] = await db
      .select({
        talents: sql<number>`count(distinct ${talentProfile.id})::integer`,
        categories: sql<number>`(
          select count(*)::integer from ${talentCategory}
        )`,
        skills: sql<number>`count(distinct ${talentSkill.name})::integer`,
        cities: sql<number>`count(distinct ${talentProfile.location})::integer`,
      })
      .from(talentProfile)
      .leftJoin(
        talentSkill,
        eq(talentSkill.profileId, talentProfile.id),
      )
      .where(publicProfileBoundary());

    return row ?? { talents: 0, categories: 0, skills: 0, cities: 0 };
  } catch (error) {
    safeDatabaseError("get public proof counts", error);
  }
}
