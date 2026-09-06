import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { asc, count, eq, like } from "drizzle-orm";
import { db } from "@/db";
import {
  talentCategory,
  talentPortfolioLink,
  talentProfile,
  talentSkill,
} from "@/db/schema";
import type { DraftProfile, ProfileStatus } from "@/domain";
import {
  getTalentProfileWorkspace,
  saveTalentProfileForUser,
  submitTalentProfileForReview,
} from "./profile-editor";
import { hasApprovedTalentSlug } from "./queries";

const suffix = crypto.randomUUID().slice(0, 8);
const ownerId = crypto.randomUUID();
const otherOwnerId = crypto.randomUUID();
const profileId = crypto.randomUUID();
const otherProfileId = crypto.randomUUID();
const baseSlug = `phase4-owner-${suffix}`;
const collisionSlug = `phase4-collision-${suffix}`;
const fixedUpdatedAt = new Date("2026-09-06T00:00:00.000Z");

let designCategoryId = "";
let developmentCategoryId = "";

const baseLinks = [
  { label: "Selected work", url: "https://example.test/selected-work" },
  { label: "Portfolio", url: "https://example.test/portfolio" },
];

function completeInput(overrides: Partial<DraftProfile> = {}): DraftProfile {
  return {
    displayName: "Phase Four Talent",
    slug: baseSlug,
    headline: "Editorial designer for thoughtful digital products",
    bio: "I help ambitious teams shape accessible digital products through research, systems thinking, and careful visual communication.",
    location: "Perth, Australia",
    categoryId: designCategoryId,
    skills: ["Product design", "Design systems"],
    links: baseLinks,
    ...overrides,
  };
}

async function resetProfile(
  status: ProfileStatus = "draft",
  values: DraftProfile = completeInput(),
) {
  await db.transaction(async (transaction) => {
    await transaction
      .delete(talentSkill)
      .where(eq(talentSkill.profileId, profileId));
    await transaction
      .delete(talentPortfolioLink)
      .where(eq(talentPortfolioLink.profileId, profileId));
    await transaction
      .update(talentProfile)
      .set({
        displayName: values.displayName,
        slug: values.slug,
        headline: values.headline,
        bio: values.bio,
        location: values.location,
        categoryId: values.categoryId,
        status,
        updatedAt: fixedUpdatedAt,
      })
      .where(eq(talentProfile.id, profileId));
    if (values.skills.length) {
      await transaction.insert(talentSkill).values(
        values.skills.map((name, position) => ({
          profileId,
          name,
          position,
        })),
      );
    }
    if (values.links.length) {
      await transaction.insert(talentPortfolioLink).values(
        values.links.map((link, position) => ({
          profileId,
          ...link,
          position,
        })),
      );
    }
  });
}

async function persistedProfile() {
  const [profile] = await db
    .select({
      displayName: talentProfile.displayName,
      slug: talentProfile.slug,
      headline: talentProfile.headline,
      bio: talentProfile.bio,
      location: talentProfile.location,
      categoryId: talentProfile.categoryId,
      status: talentProfile.status,
      updatedAt: talentProfile.updatedAt,
    })
    .from(talentProfile)
    .where(eq(talentProfile.id, profileId));
  assert.ok(profile);
  const [skills, links] = await Promise.all([
    db
      .select({ name: talentSkill.name })
      .from(talentSkill)
      .where(eq(talentSkill.profileId, profileId))
      .orderBy(asc(talentSkill.position), asc(talentSkill.id)),
    db
      .select({
        label: talentPortfolioLink.label,
        url: talentPortfolioLink.url,
      })
      .from(talentPortfolioLink)
      .where(eq(talentPortfolioLink.profileId, profileId))
      .orderBy(
        asc(talentPortfolioLink.position),
        asc(talentPortfolioLink.id),
      ),
  ]);
  return {
    ...profile,
    skills: skills.map((skill) => skill.name),
    links,
  };
}

before(async () => {
  await db
    .delete(talentProfile)
    .where(like(talentProfile.slug, "phase4-%"));
  const categories = await db
    .select({ id: talentCategory.id, slug: talentCategory.slug })
    .from(talentCategory);
  designCategoryId =
    categories.find((category) => category.slug === "design")?.id ?? "";
  developmentCategoryId =
    categories.find((category) => category.slug === "development")?.id ?? "";
  assert.ok(designCategoryId);
  assert.ok(developmentCategoryId);

  const {
    skills: _skills,
    links: _links,
    ...completeProfileValues
  } = completeInput();
  void _skills;
  void _links;

  await db.insert(talentProfile).values([
    {
      id: profileId,
      userId: ownerId,
      ...completeProfileValues,
      status: "draft",
      updatedAt: fixedUpdatedAt,
    },
    {
      id: otherProfileId,
      userId: otherOwnerId,
      displayName: "Another Phase Four Talent",
      slug: collisionSlug,
      headline: null,
      bio: null,
      location: null,
      categoryId: null,
      status: "draft",
    },
  ]);
});

beforeEach(async () => {
  await resetProfile();
});

after(async () => {
  await db
    .delete(talentProfile)
    .where(like(talentProfile.slug, "phase4-%"));
  const [remaining] = await db
    .select({ value: count() })
    .from(talentProfile)
    .where(like(talentProfile.slug, "phase4-%"));
  assert.equal(Number(remaining?.value ?? 0), 0);
});

test("an incomplete draft save succeeds and remains draft", async () => {
  const input = completeInput({
    headline: null,
    bio: null,
    location: null,
    categoryId: null,
    skills: [],
    links: [],
  });
  const result = await saveTalentProfileForUser(ownerId, input);
  assert.deepEqual(result.ok && [result.status, result.classification], [
    "draft",
    "material",
  ]);
  const persisted = await persistedProfile();
  assert.equal(persisted.status, "draft");
  assert.equal(persisted.headline, null);
  assert.deepEqual(persisted.skills, []);
});

test("a complete normal draft save remains draft", async () => {
  const result = await saveTalentProfileForUser(
    ownerId,
    completeInput({ location: "Fremantle, Australia" }),
  );
  assert.equal(result.ok && result.status, "draft");
  assert.equal((await persistedProfile()).location, "Fremantle, Australia");
});

test("a complete explicit draft submission moves to pending", async () => {
  const result = await submitTalentProfileForReview(ownerId);
  assert.deepEqual(result.ok && result.status, "pending");
  assert.equal((await persistedProfile()).status, "pending");
});

test("an incomplete draft submission is rejected without a transition", async () => {
  await resetProfile("draft", completeInput({ headline: null, skills: [] }));
  const result = await submitTalentProfileForReview(ownerId);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "publication-incomplete");
    assert.deepEqual(
      new Set(result.issues?.map((issue) => issue.path[0])),
      new Set(["headline", "skills"]),
    );
  }
  assert.equal((await persistedProfile()).status, "draft");
});

test("a normalized pending no-op preserves pending and updated_at", async () => {
  await resetProfile("pending");
  const result = await saveTalentProfileForUser(
    ownerId,
    completeInput({
      displayName: "  Phase Four Talent  ",
      slug: baseSlug.toUpperCase(),
      skills: [" Product design ", "Design systems"],
    }),
  );
  assert.deepEqual(result.ok && [result.status, result.classification], [
    "pending",
    "no-op",
  ]);
  const persisted = await persistedProfile();
  assert.equal(persisted.status, "pending");
  assert.equal(persisted.updatedAt.getTime(), fixedUpdatedAt.getTime());
});

test("every actual pending edit atomically withdraws to draft", async (context) => {
  const variants: Array<[string, DraftProfile]> = [
    ["material content", completeInput({ headline: "A changed headline that requires a new review" })],
    ["skill reorder", completeInput({ skills: ["Design systems", "Product design"] })],
    ["portfolio reorder", completeInput({ links: [...baseLinks].reverse() })],
  ];

  for (const [name, input] of variants) {
    await context.test(name, async () => {
      await resetProfile("pending");
      const result = await saveTalentProfileForUser(ownerId, input);
      assert.equal(result.ok && result.status, "draft");
      const persisted = await persistedProfile();
      assert.equal(persisted.status, "draft");
      assert.notEqual(persisted.updatedAt.getTime(), fixedUpdatedAt.getTime());
    });
  }
});

test("approved normalized no-op preserves approval and updated_at", async () => {
  await resetProfile("approved");
  const result = await saveTalentProfileForUser(ownerId, completeInput());
  assert.deepEqual(result.ok && [result.status, result.classification], [
    "approved",
    "no-op",
  ]);
  const persisted = await persistedProfile();
  assert.equal(persisted.status, "approved");
  assert.equal(persisted.updatedAt.getTime(), fixedUpdatedAt.getTime());
});

test("approved reorder-only saves remain approved and public", async (context) => {
  const variants: Array<[string, DraftProfile]> = [
    ["skill reorder", completeInput({ skills: ["Design systems", "Product design"] })],
    ["portfolio reorder", completeInput({ links: [...baseLinks].reverse() })],
  ];
  for (const [name, input] of variants) {
    await context.test(name, async () => {
      await resetProfile("approved");
      const result = await saveTalentProfileForUser(ownerId, input);
      assert.deepEqual(result.ok && [result.status, result.classification], [
        "approved",
        "reorder-only",
      ]);
      assert.equal(await hasApprovedTalentSlug(baseSlug), true);
    });
  }
});

test("every approved material change moves to pending", async (context) => {
  const variants: Array<[string, DraftProfile]> = [
    ["display name", completeInput({ displayName: "Changed Phase Four Talent" })],
    ["headline", completeInput({ headline: "A changed editorial headline for a new review" })],
    ["bio", completeInput({ bio: "This changed biography contains enough detail to make a materially different public claim for moderation." })],
    ["location", completeInput({ location: "Melbourne, Australia" })],
    ["category", completeInput({ categoryId: developmentCategoryId })],
    ["slug", completeInput({ slug: `phase4-renamed-${suffix}` })],
    ["skill add", completeInput({ skills: ["Product design", "Design systems", "Research"] })],
    ["skill remove", completeInput({ skills: ["Product design"] })],
    ["skill content", completeInput({ skills: ["Service design", "Design systems"] })],
    ["portfolio add", completeInput({ links: [...baseLinks, { label: "Writing", url: "https://example.test/writing" }] })],
    ["portfolio remove", completeInput({ links: [baseLinks[0]] })],
    ["portfolio URL", completeInput({ links: [{ ...baseLinks[0], url: "https://example.test/changed" }, baseLinks[1]] })],
    ["portfolio label", completeInput({ links: [{ ...baseLinks[0], label: "New selected work" }, baseLinks[1]] })],
    ["mixed reorder and material", completeInput({ headline: "A changed headline mixed with a collection reorder", skills: ["Design systems", "Product design"] })],
  ];

  for (const [name, input] of variants) {
    await context.test(name, async () => {
      await resetProfile("approved");
      const result = await saveTalentProfileForUser(ownerId, input);
      assert.deepEqual(result.ok && [result.status, result.classification], [
        "pending",
        "material",
      ]);
      assert.equal((await persistedProfile()).status, "pending");
    });
  }
});

test("hidden saves remain hidden, including incomplete material edits", async () => {
  await resetProfile("hidden");
  const result = await saveTalentProfileForUser(
    ownerId,
    completeInput({ headline: null, skills: [] }),
  );
  assert.equal(result.ok && result.status, "hidden");
  const persisted = await persistedProfile();
  assert.equal(persisted.status, "hidden");
  assert.equal(persisted.headline, null);
});

test("a complete explicit hidden resubmission moves to pending", async () => {
  await resetProfile("hidden");
  const result = await submitTalentProfileForReview(ownerId);
  assert.equal(result.ok && result.status, "pending");
  assert.equal((await persistedProfile()).status, "pending");
});

test("an incomplete hidden resubmission is rejected and remains hidden", async () => {
  await resetProfile("hidden", completeInput({ bio: null }));
  const result = await submitTalentProfileForReview(ownerId);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "publication-incomplete");
  assert.equal((await persistedProfile()).status, "hidden");
});

test("ownership is resolved from the authenticated user, not submitted IDs", async () => {
  const denied = await saveTalentProfileForUser(
    crypto.randomUUID(),
    completeInput({ displayName: "Attempted cross-owner edit" }),
  );
  assert.equal(denied.ok, false);
  if (!denied.ok) assert.equal(denied.reason, "profile-not-found");

  const ignoredArbitraryId = await saveTalentProfileForUser(ownerId, {
    ...completeInput({ displayName: "Owned profile edit" }),
    profileId: otherProfileId,
  });
  assert.equal(ignoredArbitraryId.ok, true);
  const [other] = await db
    .select({ displayName: talentProfile.displayName })
    .from(talentProfile)
    .where(eq(talentProfile.id, otherProfileId));
  assert.equal(other?.displayName, "Another Phase Four Talent");
});

test("invalid or anonymous-equivalent user IDs cannot save", async () => {
  const result = await saveTalentProfileForUser("", completeInput());
  assert.deepEqual(result, { ok: false, reason: "profile-not-found" });
});

test("profile validation rejects invalid collections and scalar inputs", async (context) => {
  const invalidInputs: Array<[string, unknown]> = [
    ["normalized duplicate skills", completeInput({ skills: ["Design", " design "] })],
    [">15 skills", completeInput({ skills: Array.from({ length: 16 }, (_, index) => `Skill ${index}`) })],
    ["invalid skill length", completeInput({ skills: ["S".repeat(41)] })],
    [">8 links", completeInput({ links: Array.from({ length: 9 }, (_, index) => ({ label: `Link ${index}`, url: `https://example.test/${index}` })) })],
    ["non-HTTPS link", completeInput({ links: [{ label: "Unsafe", url: "http://example.test" }] })],
    ["invalid slug", completeInput({ slug: "Invalid_slug" })],
  ];
  for (const [name, input] of invalidInputs) {
    await context.test(name, async () => {
      const result = await saveTalentProfileForUser(ownerId, input);
      assert.equal(result.ok, false);
      if (!result.ok) assert.equal(result.reason, "validation");
      assert.deepEqual((await persistedProfile()).skills, completeInput().skills);
    });
  }
});

test("slug collision and nonexistent category are safe field failures", async () => {
  const collision = await saveTalentProfileForUser(
    ownerId,
    completeInput({ slug: collisionSlug }),
  );
  assert.deepEqual(collision, { ok: false, reason: "slug-taken" });

  const missingCategory = await saveTalentProfileForUser(
    ownerId,
    completeInput({ categoryId: crypto.randomUUID() }),
  );
  assert.deepEqual(missingCategory, {
    ok: false,
    reason: "category-not-found",
  });
  assert.equal((await persistedProfile()).categoryId, designCategoryId);
});

test("failed child persistence rolls the profile and status back", async () => {
  await resetProfile("approved");
  const result = await saveTalentProfileForUser(
    ownerId,
    completeInput({
      displayName: "This update must roll back",
      skills: ["Invalid\u0000database text"],
    }),
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "unexpected");
  const persisted = await persistedProfile();
  assert.equal(persisted.displayName, "Phase Four Talent");
  assert.equal(persisted.status, "approved");
  assert.deepEqual(persisted.skills, completeInput().skills);
});

test("concurrent saves derive lifecycle from the locked current row", async () => {
  await resetProfile("approved");
  const results = await Promise.all([
    saveTalentProfileForUser(
      ownerId,
      completeInput({ headline: "The first concurrent material profile headline" }),
    ),
    saveTalentProfileForUser(
      ownerId,
      completeInput({ headline: "The second concurrent material profile headline" }),
    ),
  ]);
  assert.equal(results.every((result) => result.ok), true);
  assert.equal((await persistedProfile()).status, "draft");
});

test("approved material edits atomically disappear from public visibility", async () => {
  await resetProfile("approved");
  assert.equal(await hasApprovedTalentSlug(baseSlug), true);
  const result = await saveTalentProfileForUser(
    ownerId,
    completeInput({ location: "Sydney, Australia" }),
  );
  assert.equal(result.ok && result.status, "pending");
  const persisted = await persistedProfile();
  assert.equal(persisted.location, "Sydney, Australia");
  assert.equal(persisted.status, "pending");
  assert.equal(await hasApprovedTalentSlug(baseSlug), false);
});

test("workspace reads are owner-scoped and report persisted completeness", async () => {
  const workspace = await getTalentProfileWorkspace(ownerId);
  assert.equal(workspace?.publicationComplete, true);
  assert.equal(workspace?.requirements.every((item) => item.complete), true);
  assert.equal(await getTalentProfileWorkspace(crypto.randomUUID()), null);

  await resetProfile("draft", completeInput({ location: null, skills: [] }));
  const incomplete = await getTalentProfileWorkspace(ownerId);
  assert.equal(incomplete?.publicationComplete, false);
  assert.deepEqual(
    incomplete?.requirements
      .filter((item) => !item.complete)
      .map((item) => item.key),
    ["location", "skills"],
  );
});
