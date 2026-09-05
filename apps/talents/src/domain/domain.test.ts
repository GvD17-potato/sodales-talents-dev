import assert from "node:assert/strict";
import test from "node:test";
import {
  inquiryStatusSchema,
  profileStatusSchema,
  userRoleSchema,
} from "./constants";
import {
  getProfileStatusAfterSave,
  transitionProfileStatus,
} from "./profile-lifecycle";
import {
  classifyProfileChanges,
  type ProfileContentSnapshot,
} from "./profile-materiality";
import {
  draftProfileSchema,
  validatePublicationCompleteness,
} from "./profile-validation";
import { transitionInquiryStatus } from "./inquiry-lifecycle";

const categoryId = "11111111-1111-4111-8111-111111111111";

const completeProfile = {
  displayName: "Lena Ortiz",
  slug: "lena-ortiz",
  headline: "Product designer for complex digital services",
  bio: "I help ambitious teams turn complex service problems into clear, accessible product experiences.",
  location: "Perth, Australia",
  categoryId,
  skills: ["Product strategy", "Design systems"],
  links: [],
};

const persistedSnapshot: ProfileContentSnapshot = {
  displayName: "Lena Ortiz",
  slug: "lena-ortiz",
  headline: "Product designer for complex digital services",
  bio: "I help ambitious teams turn complex service problems into clear, accessible product experiences.",
  location: "Perth, Australia",
  categoryId,
  skills: ["Product strategy", "Design systems"],
  portfolioLinks: [
    { label: "Case study", url: "https://example.com/case-study" },
    { label: "Portfolio", url: "https://example.com" },
  ],
};

test("only talent and admin are supported persisted roles", () => {
  assert.equal(userRoleSchema.parse("talent"), "talent");
  assert.equal(userRoleSchema.parse("admin"), "admin");
  assert.equal(userRoleSchema.safeParse("visitor").success, false);
});

test("only the four approved profile statuses are supported", () => {
  for (const status of ["draft", "pending", "approved", "hidden"]) {
    assert.equal(profileStatusSchema.safeParse(status).success, true);
  }
  assert.equal(profileStatusSchema.safeParse("published").success, false);
});

test("only the three approved inquiry statuses are supported", () => {
  for (const status of ["new", "read", "archived"]) {
    assert.equal(inquiryStatusSchema.safeParse(status).success, true);
  }
  assert.equal(inquiryStatusSchema.safeParse("deleted").success, false);
});

test("draft-save validation allows incomplete publication fields", () => {
  const result = draftProfileSchema.safeParse({
    displayName: "New Talent",
    slug: "new-talent",
  });
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.deepEqual(
    {
      headline: result.data.headline,
      bio: result.data.bio,
      location: result.data.location,
      categoryId: result.data.categoryId,
      skills: result.data.skills,
      links: result.data.links,
    },
    {
      headline: null,
      bio: null,
      location: null,
      categoryId: null,
      skills: [],
      links: [],
    },
  );
});

test("draft-save validation still validates optional fields when supplied", () => {
  const result = draftProfileSchema.safeParse({
    ...completeProfile,
    headline: "Too short",
  });
  assert.equal(result.success, false);
});

test("publication completeness accepts every required field and no portfolio", () => {
  const result = validatePublicationCompleteness(completeProfile, {
    categoryExists: true,
  });
  assert.equal(result.success, true);
});

test("publication completeness rejects every missing publication field", () => {
  const result = validatePublicationCompleteness(
    {
      displayName: "New Talent",
      slug: "new-talent",
      headline: null,
      bio: null,
      location: null,
      categoryId: null,
      skills: [],
      links: [],
    },
    { categoryExists: false },
  );
  assert.equal(result.success, false);
  if (result.success) return;
  const paths = new Set(result.error.issues.map((issue) => issue.path[0]));
  for (const path of ["headline", "bio", "location", "categoryId", "skills"]) {
    assert.equal(paths.has(path), true);
  }
});

test("publication completeness rejects a missing category record", () => {
  const result = validatePublicationCompleteness(completeProfile, {
    categoryExists: false,
  });
  assert.equal(result.success, false);
  if (result.success) return;
  assert.equal(
    result.error.issues.some((issue) => issue.path[0] === "categoryId"),
    true,
  );
});

test("profile validation accepts every exact minimum and maximum boundary", () => {
  const minimum = validatePublicationCompleteness(
    {
      displayName: "AB",
      slug: "abc",
      headline: "h".repeat(10),
      bio: "b".repeat(50),
      location: "WA",
      categoryId,
      skills: ["S"],
      links: [],
    },
    { categoryExists: true },
  );
  assert.equal(minimum.success, true);

  const maximum = validatePublicationCompleteness(
    {
      displayName: "D".repeat(80),
      slug: "s".repeat(60),
      headline: "h".repeat(120),
      bio: "b".repeat(2000),
      location: "L".repeat(80),
      categoryId,
      skills: Array.from({ length: 15 }, (_, index) => `Skill ${index + 1}`),
      links: Array.from({ length: 8 }, () => ({
        label: "L".repeat(60),
        url: "https://example.com/work",
      })),
    },
    { categoryExists: true },
  );
  assert.equal(maximum.success, true);
});

test("profile validation rejects out-of-range scalar fields and invalid category UUIDs", () => {
  const invalidFields = [
    { displayName: "A" },
    { displayName: "D".repeat(81) },
    { headline: "h".repeat(9) },
    { headline: "h".repeat(121) },
    { bio: "b".repeat(49) },
    { bio: "b".repeat(2001) },
    { location: "L" },
    { location: "L".repeat(81) },
    { categoryId: "not-a-uuid" },
  ];

  for (const invalidField of invalidFields) {
    assert.equal(
      validatePublicationCompleteness(
        { ...completeProfile, ...invalidField },
        { categoryExists: true },
      ).success,
      false,
    );
  }
});

test("slug validation normalizes case but rejects content outside the approved pattern", () => {
  const normalized = draftProfileSchema.safeParse({
    displayName: "New Talent",
    slug: "NEW-TALENT",
  });
  assert.equal(normalized.success, true);
  if (normalized.success) assert.equal(normalized.data.slug, "new-talent");

  for (const slug of [
    "ab",
    "s".repeat(61),
    "bad_slug",
    "bad--slug",
    "-bad-slug",
    "bad-slug-",
  ]) {
    assert.equal(
      draftProfileSchema.safeParse({ displayName: "New Talent", slug }).success,
      false,
      slug,
    );
  }
});

test("skill validation enforces count, length, and normalized uniqueness", () => {
  const invalidSkills = [
    Array.from({ length: 16 }, (_, index) => `Skill ${index + 1}`),
    ["S".repeat(41)],
    ["Product design", " product DESIGN "],
  ];

  for (const skills of invalidSkills) {
    assert.equal(
      draftProfileSchema.safeParse({ ...completeProfile, skills }).success,
      false,
    );
  }
});

test("portfolio validation enforces count, label, URL, and HTTPS requirements", () => {
  const validLink = { label: "Portfolio", url: "https://example.com" };
  const invalidLinks = [
    Array.from({ length: 9 }, () => validLink),
    [{ ...validLink, label: "" }],
    [{ ...validLink, label: "L".repeat(61) }],
    [{ ...validLink, url: "not-a-url" }],
    [{ ...validLink, url: "http://example.com" }],
  ];

  for (const links of invalidLinks) {
    assert.equal(
      draftProfileSchema.safeParse({ ...completeProfile, links }).success,
      false,
    );
  }
});

test("profile submission, approval, hiding, and resubmission transitions are legal", () => {
  const transitions = [
    ["draft", "submit", "pending"],
    ["pending", "approve", "approved"],
    ["pending", "hide", "hidden"],
    ["approved", "hide", "hidden"],
    ["hidden", "resubmit", "pending"],
  ] as const;

  for (const [current, event, expected] of transitions) {
    assert.deepEqual(transitionProfileStatus(current, event, true), {
      ok: true,
      status: expected,
    });
  }
});

test("completeness-gated profile transitions fail without changing status", () => {
  for (const [current, event] of [
    ["draft", "submit"],
    ["pending", "approve"],
    ["hidden", "resubmit"],
  ] as const) {
    assert.deepEqual(transitionProfileStatus(current, event, false), {
      ok: false,
      status: current,
      reason: "publication-incomplete",
    });
  }
});

test("unsupported profile transitions are rejected", () => {
  assert.deepEqual(transitionProfileStatus("approved", "approve", true), {
    ok: false,
    status: "approved",
    reason: "transition-not-allowed",
  });
  assert.deepEqual(transitionProfileStatus("hidden", "hide", true), {
    ok: false,
    status: "hidden",
    reason: "transition-not-allowed",
  });
});

test("profile save status rules preserve hidden and only withdraw changed pending profiles", () => {
  assert.equal(getProfileStatusAfterSave("hidden", "material"), "hidden");
  assert.equal(getProfileStatusAfterSave("hidden", "no-op"), "hidden");
  assert.equal(getProfileStatusAfterSave("pending", "no-op"), "pending");
  assert.equal(getProfileStatusAfterSave("pending", "reorder-only"), "draft");
  assert.equal(getProfileStatusAfterSave("pending", "material"), "draft");
  assert.equal(getProfileStatusAfterSave("draft", "material"), "draft");
  assert.equal(getProfileStatusAfterSave("approved", "material"), "pending");
  assert.equal(getProfileStatusAfterSave("approved", "reorder-only"), "approved");
  assert.equal(getProfileStatusAfterSave("approved", "no-op"), "approved");
});

test("every approved inquiry transition is accepted", () => {
  for (const [current, next] of [
    ["new", "read"],
    ["read", "new"],
    ["new", "archived"],
    ["read", "archived"],
    ["archived", "read"],
  ] as const) {
    assert.deepEqual(transitionInquiryStatus(current, next), {
      ok: true,
      status: next,
    });
  }
});

test("archived to new and unsupported inquiry transitions are rejected", () => {
  assert.deepEqual(transitionInquiryStatus("archived", "new"), {
    ok: false,
    status: "archived",
    reason: "transition-not-allowed",
  });
  assert.equal(transitionInquiryStatus("new", "new").ok, false);
  assert.equal(transitionInquiryStatus("archived", "archived").ok, false);
});

test("normalized no-op profile content is classified as no-op", () => {
  const submitted = {
    ...persistedSnapshot,
    displayName: "  Lena Ortiz  ",
    slug: "LENA-ORTIZ",
    skills: [" Product strategy ", "Design systems"],
    portfolioLinks: [
      { label: " Case study ", url: " https://example.com/case-study " },
      { label: "Portfolio", url: "https://example.com" },
    ],
  };
  assert.deepEqual(classifyProfileChanges(persistedSnapshot, submitted), {
    classification: "no-op",
    materialReasons: [],
    reorderedCollections: [],
  });
});

test("every material scalar profile field is classified as material", () => {
  const changes: Array<[keyof ProfileContentSnapshot, string | null]> = [
    ["displayName", "Lena O."],
    ["headline", "A substantively different product design headline"],
    ["bio", "A substantively different biography that changes the public claims made by this profile."],
    ["location", "Melbourne, Australia"],
    ["categoryId", "22222222-2222-4222-8222-222222222222"],
    ["slug", "lena-ortiz-design"],
  ];

  for (const [field, value] of changes) {
    const result = classifyProfileChanges(persistedSnapshot, {
      ...persistedSnapshot,
      [field]: value,
    });
    assert.equal(result.classification, "material", field);
    assert.equal(result.materialReasons.includes(field), true, field);
  }
});

test("skill add, remove, and content changes are material", () => {
  for (const skills of [
    [...persistedSnapshot.skills, "Research"],
    [persistedSnapshot.skills[0]],
    ["Service design", persistedSnapshot.skills[1]],
  ]) {
    assert.equal(
      classifyProfileChanges(persistedSnapshot, {
        ...persistedSnapshot,
        skills,
      }).classification,
      "material",
    );
  }
});

test("portfolio add, remove, URL, and label changes are material", () => {
  const variants = [
    [
      ...persistedSnapshot.portfolioLinks,
      { label: "Writing", url: "https://example.com/writing" },
    ],
    [persistedSnapshot.portfolioLinks[0]],
    [
      { label: "Case study", url: "https://example.com/changed" },
      persistedSnapshot.portfolioLinks[1],
    ],
    [
      { label: "Selected case study", url: "https://example.com/case-study" },
      persistedSnapshot.portfolioLinks[1],
    ],
  ];

  for (const portfolioLinks of variants) {
    assert.equal(
      classifyProfileChanges(persistedSnapshot, {
        ...persistedSnapshot,
        portfolioLinks,
      }).classification,
      "material",
    );
  }
});

test("skill reorder alone is non-material", () => {
  assert.deepEqual(
    classifyProfileChanges(persistedSnapshot, {
      ...persistedSnapshot,
      skills: [...persistedSnapshot.skills].reverse(),
    }),
    {
      classification: "reorder-only",
      materialReasons: [],
      reorderedCollections: ["skills"],
    },
  );
});

test("portfolio reorder alone is non-material", () => {
  assert.deepEqual(
    classifyProfileChanges(persistedSnapshot, {
      ...persistedSnapshot,
      portfolioLinks: [...persistedSnapshot.portfolioLinks].reverse(),
    }),
    {
      classification: "reorder-only",
      materialReasons: [],
      reorderedCollections: ["portfolioLinks"],
    },
  );
});

test("a reorder mixed with a material change is material", () => {
  const result = classifyProfileChanges(persistedSnapshot, {
    ...persistedSnapshot,
    headline: "A newly changed headline that requires another review",
    skills: [...persistedSnapshot.skills].reverse(),
  });
  assert.equal(result.classification, "material");
  assert.deepEqual(result.materialReasons, ["headline"]);
  assert.deepEqual(result.reorderedCollections, ["skills"]);
});
