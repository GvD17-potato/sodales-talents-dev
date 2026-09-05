export type ProfileChangeClassification =
  | "material"
  | "reorder-only"
  | "no-op";

export type PortfolioLinkContent = {
  label: string;
  url: string;
};

export type ProfileContentSnapshot = {
  displayName: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  categoryId: string | null;
  slug: string;
  skills: string[];
  portfolioLinks: PortfolioLinkContent[];
};

type MaterialReason =
  | "displayName"
  | "headline"
  | "bio"
  | "location"
  | "categoryId"
  | "slug"
  | "skills"
  | "portfolioLinks";

type ReorderedCollection = "skills" | "portfolioLinks";

export type ProfileChangeResult = {
  classification: ProfileChangeClassification;
  materialReasons: MaterialReason[];
  reorderedCollections: ReorderedCollection[];
};

const scalarFields = [
  "displayName",
  "headline",
  "bio",
  "location",
  "categoryId",
  "slug",
] as const;

function normalizeText(value: string | null) {
  return value?.replace(/\r\n?/g, "\n").trim() ?? null;
}

function normalizeScalar(
  field: (typeof scalarFields)[number],
  value: string | null,
) {
  const normalized = normalizeText(value);
  if (field === "slug" || field === "categoryId") {
    return normalized?.toLocaleLowerCase("en") ?? null;
  }
  return normalized;
}

function normalizeSkills(skills: string[]) {
  return skills.map((skill) => normalizeText(skill) ?? "");
}

function normalizePortfolioLinks(links: PortfolioLinkContent[]) {
  return links.map((link) => ({
    label: normalizeText(link.label) ?? "",
    url: normalizeText(link.url) ?? "",
  }));
}

function sameSequence<T>(left: T[], right: T[]) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sameMembers<T>(left: T[], right: T[]) {
  const sortBySerializedValue = (values: T[]) =>
    values.map((value) => JSON.stringify(value)).sort();
  return sameSequence(sortBySerializedValue(left), sortBySerializedValue(right));
}

export function classifyProfileChanges(
  persisted: ProfileContentSnapshot,
  submitted: ProfileContentSnapshot,
): ProfileChangeResult {
  const materialReasons: MaterialReason[] = [];
  const reorderedCollections: ReorderedCollection[] = [];

  for (const field of scalarFields) {
    if (
      normalizeScalar(field, persisted[field]) !==
      normalizeScalar(field, submitted[field])
    ) {
      materialReasons.push(field);
    }
  }

  const persistedSkills = normalizeSkills(persisted.skills);
  const submittedSkills = normalizeSkills(submitted.skills);
  if (!sameMembers(persistedSkills, submittedSkills)) {
    materialReasons.push("skills");
  } else if (!sameSequence(persistedSkills, submittedSkills)) {
    reorderedCollections.push("skills");
  }

  const persistedLinks = normalizePortfolioLinks(persisted.portfolioLinks);
  const submittedLinks = normalizePortfolioLinks(submitted.portfolioLinks);
  if (!sameMembers(persistedLinks, submittedLinks)) {
    materialReasons.push("portfolioLinks");
  } else if (!sameSequence(persistedLinks, submittedLinks)) {
    reorderedCollections.push("portfolioLinks");
  }

  return {
    classification:
      materialReasons.length > 0
        ? "material"
        : reorderedCollections.length > 0
          ? "reorder-only"
          : "no-op",
    materialReasons,
    reorderedCollections,
  };
}
