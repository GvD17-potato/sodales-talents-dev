import { approvedTalentFixtures, categories } from "./fixtures";
import type { PublicTalent, TalentCategory, TalentFilters } from "./types";

export const PUBLIC_DATA_SOURCE = "TESTING FIXTURE DATA" as const;

function assertTestingFixtureMode() {
  if (process.env.TALENTS_DATA_SOURCE === "database") {
    throw new Error(
      "The database data source was requested, but the Neon public-query adapter is not implemented.",
    );
  }
}

export async function listTalentCategories(): Promise<TalentCategory[]> {
  assertTestingFixtureMode();
  return categories;
}

export async function listApprovedTalents(
  filters: TalentFilters = {},
): Promise<PublicTalent[]> {
  assertTestingFixtureMode();

  const query = filters.q?.trim().toLocaleLowerCase() ?? "";
  const category = filters.category?.trim().toLocaleLowerCase() ?? "";

  return approvedTalentFixtures.filter((talent) => {
    if (talent.status !== "approved") return false;
    if (category && talent.category.slug !== category) return false;
    if (!query) return true;

    const searchable = [
      talent.displayName,
      talent.headline,
      talent.bio,
      talent.location,
      ...talent.skills,
    ]
      .join(" ")
      .toLocaleLowerCase();

    return searchable.includes(query);
  });
}

export async function getApprovedTalentBySlug(
  slug: string,
): Promise<PublicTalent | null> {
  assertTestingFixtureMode();
  return (
    approvedTalentFixtures.find(
      (talent) => talent.status === "approved" && talent.slug === slug,
    ) ?? null
  );
}

export async function getPublicProofCounts() {
  const talents = await listApprovedTalents();

  return {
    talents: talents.length,
    categories: categories.length,
    skills: new Set(talents.flatMap((talent) => talent.skills)).size,
    cities: new Set(talents.map((talent) => talent.location)).size,
  };
}
