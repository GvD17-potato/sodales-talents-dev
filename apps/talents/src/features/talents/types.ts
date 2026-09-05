export type TalentCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

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
  category: TalentCategory;
  skills: string[];
  portfolioLinks: PortfolioLink[];
  memberSince: string;
  status: "approved";
  featured: boolean;
};

export type TalentFilters = {
  q?: string;
  category?: string;
};
