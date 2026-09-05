import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { requireDatabaseUrl } from "./read-database-url";
import { talentCategory } from "./schema";

const categories = [
  {
    slug: "design",
    name: "Design",
    description: "Product, visual, brand, and experience design.",
  },
  {
    slug: "development",
    name: "Development",
    description: "Frontend, backend, full-stack, and creative development.",
  },
  {
    slug: "photography",
    name: "Photography",
    description: "Editorial, commercial, documentary, and product photography.",
  },
  {
    slug: "writing",
    name: "Writing",
    description: "Copywriting, editorial, content strategy, and storytelling.",
  },
  {
    slug: "video",
    name: "Video",
    description: "Direction, cinematography, editing, and motion production.",
  },
  {
    slug: "music",
    name: "Music",
    description: "Composition, production, performance, and sound design.",
  },
] as const;

async function seed() {
  const sqlClient = postgres(requireDatabaseUrl(), {
    prepare: false,
    max: 1,
  });
  const database = drizzle(sqlClient);

  try {
    await database
      .insert(talentCategory)
      .values([...categories])
      .onConflictDoNothing({ target: talentCategory.slug });
    console.log(`Seed complete: ${categories.length} talent categories ensured.`);
  } finally {
    await sqlClient.end({ timeout: 5 });
  }
}

seed().catch((error: unknown) => {
  if (error instanceof Error && error.message.startsWith("BLOCKED ON")) {
    console.error(error.message);
  } else {
    console.error("Database seed failed without exposing connection details.");
  }
  process.exitCode = 1;
});
