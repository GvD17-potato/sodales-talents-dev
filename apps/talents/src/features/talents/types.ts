export type TalentCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  approvedTalentCount: number;
};

export type PublicTalentCategory = Omit<
  TalentCategory,
  "approvedTalentCount"
>;

export type PortfolioLink = {
  label: string;
  url: string;
};

export type PublicTalent = {
  id: string;
  slug: string;
  displayName: string;
  headline: string;
  bio: string;
  location: string;
  category: PublicTalentCategory;
  skills: string[];
  portfolioLinks: PortfolioLink[];
  memberSince: string;
};

export type TalentFilters = {
  q?: string;
  category?: string;
  limit?: number;
};
