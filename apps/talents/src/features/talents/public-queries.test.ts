import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { count, inArray, like } from "drizzle-orm";
import { db } from "@/db";
import {
  profileModeration,
  talentPortfolioLink,
  talentProfile,
  talentSkill,
} from "@/db/schema";
import {
  getApprovedTalentBySlug,
  getPublicProofCounts,
  hasApprovedTalentSlug,
  listApprovedTalents,
  listTalentCategories,
} from "./queries";

const suffix = crypto.randomUUID().slice(0, 8);
const needle = `phase3needle${suffix}`;
const orderedNeedle = `phase3order${suffix}`;
const slugs = {
  approvedDesign: `phase3-approved-design-${suffix}`,
  approvedDevelopment: `phase3-approved-development-${suffix}`,
  draft: `phase3-draft-${suffix}`,
  pending: `phase3-pending-${suffix}`,
  hidden: `phase3-hidden-${suffix}`,
};
const profileIds = Object.fromEntries(
  Object.keys(slugs).map((key) => [key, crypto.randomUUID()]),
) as Record<keyof typeof slugs, string>;

let designCategoryId = "";
let developmentCategoryId = "";
let baselineDesignCount = 0;
let baselineDevelopmentCount = 0;
let baselineProofCounts = { talents: 0, categories: 0, skills: 0, cities: 0 };

function completeProfile(
  key: keyof typeof slugs,
  status: "draft" | "pending" | "approved" | "hidden",
  categoryId: string,
  updatedAt: Date,
) {
  return {
    id: profileIds[key],
    userId: crypto.randomUUID(),
    slug: slugs[key],
    displayName: `Phase Three ${key} ${needle}`,
    headline: `Database-backed public query verification for ${needle}.`,
    bio: `This temporary development profile verifies that public SQL queries enforce visibility, projection, filtering, and deterministic child ordering for ${needle}.`,
    location: `Phase Three City ${needle}`,
    categoryId,
    status,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt,
  };
}

before(async () => {
  await db
    .delete(talentProfile)
    .where(like(talentProfile.slug, "phase3-%"));

  const categories = await listTalentCategories();
  assert.deepEqual(
    categories.map(({ name, slug }) => ({ name, slug })),
    [
      { name: "Design", slug: "design" },
      { name: "Development", slug: "development" },
      { name: "Music", slug: "music" },
      { name: "Photography", slug: "photography" },
      { name: "Video", slug: "video" },
      { name: "Writing", slug: "writing" },
    ],
  );
  const design = categories.find((category) => category.slug === "design");
  const development = categories.find(
    (category) => category.slug === "development",
  );
  assert.ok(design);
  assert.ok(development);
  designCategoryId = design.id;
  developmentCategoryId = development.id;
  baselineDesignCount = design.approvedTalentCount;
  baselineDevelopmentCount = development.approvedTalentCount;
  baselineProofCounts = await getPublicProofCounts();

  await db.insert(talentProfile).values([
    completeProfile(
      "approvedDesign",
      "approved",
      designCategoryId,
      new Date("2099-01-02T00:00:00.000Z"),
    ),
    completeProfile(
      "approvedDevelopment",
      "approved",
      developmentCategoryId,
      new Date("2099-01-01T00:00:00.000Z"),
    ),
    completeProfile(
      "draft",
      "draft",
      designCategoryId,
      new Date("2099-01-05T00:00:00.000Z"),
    ),
    completeProfile(
      "pending",
      "pending",
      designCategoryId,
      new Date("2099-01-04T00:00:00.000Z"),
    ),
    completeProfile(
      "hidden",
      "hidden",
      designCategoryId,
      new Date("2099-01-03T00:00:00.000Z"),
    ),
  ]);

  await db.insert(talentSkill).values([
    {
      id: crypto.randomUUID(),
      profileId: profileIds.approvedDesign,
      name: `Third skill ${needle}`,
      position: 2,
    },
    {
      id: crypto.randomUUID(),
      profileId: profileIds.approvedDesign,
      name: `First skill ${needle}`,
      position: 0,
    },
    {
      id: crypto.randomUUID(),
      profileId: profileIds.approvedDesign,
      name: `Second skill ${orderedNeedle}`,
      position: 1,
    },
    {
      id: crypto.randomUUID(),
      profileId: profileIds.approvedDevelopment,
      name: `Development skill ${needle} ${orderedNeedle}`,
      position: 0,
    },
    ...(["draft", "pending", "hidden"] as const).map((key) => ({
      id: crypto.randomUUID(),
      profileId: profileIds[key],
      name: `Non-public skill ${needle}`,
      position: 0,
    })),
  ]);

  await db.insert(talentPortfolioLink).values([
    {
      id: crypto.randomUUID(),
      profileId: profileIds.approvedDesign,
      label: "Third link",
      url: `https://example.test/${suffix}/third`,
      position: 2,
    },
    {
      id: crypto.randomUUID(),
      profileId: profileIds.approvedDesign,
      label: "First link",
      url: `https://example.test/${suffix}/first`,
      position: 0,
    },
    {
      id: crypto.randomUUID(),
      profileId: profileIds.approvedDesign,
      label: "Second link",
      url: `https://example.test/${suffix}/second`,
      position: 1,
    },
  ]);

  await db.insert(profileModeration).values({
    profileId: profileIds.approvedDesign,
    action: "approved",
    note: `Private moderation note ${suffix}`,
    moderatorUserId: crypto.randomUUID(),
  });
});

after(async () => {
  await db.delete(talentProfile).where(inArray(talentProfile.id, Object.values(profileIds)));
  const [remaining] = await db
    .select({ value: count() })
    .from(talentProfile)
    .where(like(talentProfile.slug, "phase3-%"));
  assert.equal(Number(remaining?.value ?? 0), 0);
});

test("approved profiles appear in the public listing", async () => {
  const talents = await listApprovedTalents({ q: needle });
  const ids = new Set(talents.map((talent) => talent.id));
  assert.equal(ids.has(profileIds.approvedDesign), true);
  assert.equal(ids.has(profileIds.approvedDevelopment), true);
});

for (const status of ["draft", "pending", "hidden"] as const) {
  test(`${status} profiles do not appear in the public listing`, async () => {
    const talents = await listApprovedTalents({ q: needle });
    assert.equal(
      talents.some((talent) => talent.id === profileIds[status]),
      false,
    );
  });
}

test("an approved slug resolves", async () => {
  const talent = await getApprovedTalentBySlug(slugs.approvedDesign);
  assert.equal(talent?.id, profileIds.approvedDesign);
});

test("the middleware visibility check admits approved slugs only", async () => {
  assert.equal(await hasApprovedTalentSlug(slugs.approvedDesign), true);
  assert.equal(await hasApprovedTalentSlug(slugs.draft), false);
  assert.equal(await hasApprovedTalentSlug(slugs.pending), false);
  assert.equal(await hasApprovedTalentSlug(slugs.hidden), false);
  assert.equal(await hasApprovedTalentSlug(`phase3-missing-${suffix}`), false);
});

for (const status of ["draft", "pending", "hidden"] as const) {
  test(`${status} slugs resolve as not found`, async () => {
    assert.equal(await getApprovedTalentBySlug(slugs[status]), null);
  });
}

test("a missing slug resolves as not found", async () => {
  assert.equal(
    await getApprovedTalentBySlug(`phase3-missing-${suffix}`),
    null,
  );
});

test("a valid category filters approved profiles", async () => {
  const talents = await listApprovedTalents({
    q: needle,
    category: "design",
  });
  assert.deepEqual(
    talents.map((talent) => talent.id),
    [profileIds.approvedDesign],
  );
});

test("an invalid category safely normalizes to the unfiltered result", async () => {
  const talents = await listApprovedTalents({
    q: needle,
    category: `missing-${suffix}`,
  });
  assert.deepEqual(
    new Set(talents.map((talent) => talent.id)),
    new Set([profileIds.approvedDesign, profileIds.approvedDevelopment]),
  );
});

test("category counts include approved profiles only", async () => {
  const categories = await listTalentCategories();
  assert.equal(
    categories.find((category) => category.slug === "design")
      ?.approvedTalentCount,
    baselineDesignCount + 1,
  );
  assert.equal(
    categories.find((category) => category.slug === "development")
      ?.approvedTalentCount,
    baselineDevelopmentCount + 1,
  );
});

test("search returns approved matches and never non-approved matches", async () => {
  const talents = await listApprovedTalents({ q: needle });
  const ids = new Set(talents.map((talent) => talent.id));
  assert.deepEqual(
    ids,
    new Set([profileIds.approvedDesign, profileIds.approvedDevelopment]),
  );
});

test("search and category filtering work together", async () => {
  const talents = await listApprovedTalents({
    q: orderedNeedle,
    category: "development",
  });
  assert.deepEqual(
    talents.map((talent) => talent.id),
    [profileIds.approvedDevelopment],
  );
});

test("the public projection excludes owner and internal data", async () => {
  const talent = await getApprovedTalentBySlug(slugs.approvedDesign);
  assert.ok(talent);
  assert.deepEqual(Object.keys(talent).sort(), [
    "bio",
    "category",
    "displayName",
    "headline",
    "id",
    "location",
    "memberSince",
    "portfolioLinks",
    "skills",
    "slug",
  ]);
  const serialized = JSON.stringify(talent);
  assert.equal(serialized.includes("userId"), false);
  assert.equal(serialized.includes("moderation"), false);
  assert.equal(serialized.includes("Private moderation note"), false);
  assert.equal(serialized.includes("status"), false);
  assert.equal(serialized.includes("createdAt"), false);
  assert.equal(serialized.includes("updatedAt"), false);
});

test("skills and portfolio links use deterministic position ordering", async () => {
  const talent = await getApprovedTalentBySlug(slugs.approvedDesign);
  assert.ok(talent);
  assert.deepEqual(talent.skills, [
    `First skill ${needle}`,
    `Second skill ${orderedNeedle}`,
    `Third skill ${needle}`,
  ]);
  assert.deepEqual(
    talent.portfolioLinks.map((link) => link.label),
    ["First link", "Second link", "Third link"],
  );
});

test("talent results use deterministic updated-at and id ordering", async () => {
  const talents = await listApprovedTalents({ q: orderedNeedle });
  assert.deepEqual(
    talents.map((talent) => talent.id),
    [profileIds.approvedDesign, profileIds.approvedDevelopment],
  );
});

test("homepage proof counts include approved public data only", async () => {
  const counts = await getPublicProofCounts();
  assert.equal(counts.talents, baselineProofCounts.talents + 2);
  assert.equal(counts.categories, baselineProofCounts.categories);
  assert.equal(counts.cities, baselineProofCounts.cities + 1);
  assert.equal(counts.skills, baselineProofCounts.skills + 4);
});
