import type { PublicTalent, TalentCategory } from "./types";

/**
 * TESTING FIXTURE DATA
 *
 * Approved-only demo content for the expedited public preview. This is not a
 * database implementation and must be replaced by the SQL adapter after Neon
 * is connected.
 */
export const categories: TalentCategory[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    slug: "design",
    name: "Design",
    description: "Product systems, brands, and thoughtful digital experiences.",
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    slug: "development",
    name: "Development",
    description: "Reliable web platforms and ambitious interactive products.",
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    slug: "photography",
    name: "Photography",
    description: "Editorial, commercial, and documentary image-making.",
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    slug: "writing",
    name: "Writing",
    description: "Distinct voices for products, campaigns, and publications.",
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    slug: "video",
    name: "Video",
    description: "Direction, production, editing, and moving-image craft.",
  },
  {
    id: "10000000-0000-4000-8000-000000000006",
    slug: "music",
    name: "Music",
    description: "Composition, sound design, production, and performance.",
  },
];

const categoryBySlug = Object.fromEntries(
  categories.map((category) => [category.slug, category]),
);

export const approvedTalentFixtures: PublicTalent[] = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    slug: "lena-ortiz",
    displayName: "Lena Ortiz",
    headline: "Product designer shaping clear, confident digital services.",
    bio: "Lena turns complicated services into calm, useful product experiences. Her practice moves from research and service mapping through interaction design and production-ready design systems, with close collaboration at every stage.",
    location: "Melbourne, Australia",
    category: categoryBySlug.design,
    skills: [
      "Product strategy",
      "UX research",
      "Interaction design",
      "Design systems",
      "Prototyping",
    ],
    portfolioLinks: [
      { label: "Selected product work", url: "https://example.com/lena/product" },
      { label: "Design systems journal", url: "https://example.com/lena/systems" },
    ],
    memberSince: "2024",
    status: "approved",
    featured: true,
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    slug: "marco-chen",
    displayName: "Marco Chen",
    headline: "Full-stack developer for expressive, dependable web products.",
    bio: "Marco builds high-quality digital products that hold up under real use. He works across modern frontends, robust backend services, data modelling, and performance engineering, translating ambitious creative direction into maintainable systems.",
    location: "Singapore",
    category: categoryBySlug.development,
    skills: [
      "TypeScript",
      "React",
      "Next.js",
      "Postgres",
      "API architecture",
      "Performance",
    ],
    portfolioLinks: [
      { label: "Platform case studies", url: "https://example.com/marco/platforms" },
      { label: "Open-source work", url: "https://example.com/marco/code" },
    ],
    memberSince: "2023",
    status: "approved",
    featured: true,
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    slug: "yuki-tanaka",
    displayName: "Yuki Tanaka",
    headline: "Photographer finding human detail in places, work, and culture.",
    bio: "Yuki creates documentary-led photography for editorial and commercial teams. Her images are composed but never over-directed, giving brands and publications a grounded visual language with warmth, texture, and a strong sense of place.",
    location: "Tokyo, Japan",
    category: categoryBySlug.photography,
    skills: [
      "Editorial photography",
      "Art direction",
      "Portraiture",
      "Location work",
      "Post-production",
    ],
    portfolioLinks: [
      { label: "Editorial archive", url: "https://example.com/yuki/editorial" },
      { label: "Commissioned stories", url: "https://example.com/yuki/stories" },
    ],
    memberSince: "2025",
    status: "approved",
    featured: true,
  },
  {
    id: "20000000-0000-4000-8000-000000000004",
    slug: "priya-nair",
    displayName: "Priya Nair",
    headline: "Writer giving complex ideas a precise and memorable voice.",
    bio: "Priya works with organisations at moments of change: a new offer, a sharper position, or a story that needs to travel. She combines strategic clarity with warm, economical writing across brands, products, campaigns, and long-form editorial.",
    location: "Perth, Australia",
    category: categoryBySlug.writing,
    skills: [
      "Brand voice",
      "Copywriting",
      "Content strategy",
      "Editorial",
      "Campaign concepts",
    ],
    portfolioLinks: [
      { label: "Writing portfolio", url: "https://example.com/priya/work" },
      { label: "Essays and interviews", url: "https://example.com/priya/editorial" },
    ],
    memberSince: "2024",
    status: "approved",
    featured: true,
  },
];
