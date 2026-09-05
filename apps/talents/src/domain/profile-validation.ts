import { z } from "zod";

function emptyStringToNull(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? null : value;
}

const displayNameSchema = z.string().trim().min(2).max(80);
const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const headlineSchema = z.string().trim().min(10).max(120);
const bioSchema = z.string().trim().min(50).max(2000);
const locationSchema = z.string().trim().min(2).max(80);
const categoryIdSchema = z.uuid();
const skillSchema = z.string().trim().min(1).max(40);
const portfolioLinkSchema = z.object({
  label: z.string().trim().min(1).max(60),
  url: z
    .string()
    .trim()
    .url()
    .refine((url) => url.startsWith("https://"), {
      message: "Portfolio URLs must use https://",
    }),
});

function createSkillsSchema(minimum: number) {
  return z
    .array(skillSchema)
    .min(minimum)
    .max(15)
    .superRefine((skills, context) => {
      const seen = new Set<string>();
      skills.forEach((skill, index) => {
        const normalized = skill.toLocaleLowerCase("en");
        if (seen.has(normalized)) {
          context.addIssue({
            code: "custom",
            message: "Skills must be unique",
            path: [index],
          });
        }
        seen.add(normalized);
      });
    });
}

const linksSchema = z.array(portfolioLinkSchema).max(8);

export const draftProfileSchema = z.object({
  displayName: displayNameSchema,
  slug: slugSchema,
  headline: z
    .preprocess(emptyStringToNull, headlineSchema.nullable().optional())
    .transform((value) => value ?? null),
  bio: z
    .preprocess(emptyStringToNull, bioSchema.nullable().optional())
    .transform((value) => value ?? null),
  location: z
    .preprocess(emptyStringToNull, locationSchema.nullable().optional())
    .transform((value) => value ?? null),
  categoryId: z
    .preprocess(emptyStringToNull, categoryIdSchema.nullable().optional())
    .transform((value) => value ?? null),
  skills: createSkillsSchema(0).default([]),
  links: linksSchema.default([]),
});

export const publicationProfileSchema = z.object({
  displayName: displayNameSchema,
  slug: slugSchema,
  headline: z.preprocess(emptyStringToNull, headlineSchema),
  bio: z.preprocess(emptyStringToNull, bioSchema),
  location: z.preprocess(emptyStringToNull, locationSchema),
  categoryId: z.preprocess(emptyStringToNull, categoryIdSchema),
  skills: createSkillsSchema(1),
  links: linksSchema,
});

export function validatePublicationCompleteness(
  input: unknown,
  options: { categoryExists: boolean },
) {
  return publicationProfileSchema
    .superRefine((_profile, context) => {
      if (!options.categoryExists) {
        context.addIssue({
          code: "custom",
          message: "Select an existing category",
          path: ["categoryId"],
        });
      }
    })
    .safeParse(input);
}

export type DraftProfileInput = z.input<typeof draftProfileSchema>;
export type DraftProfile = z.output<typeof draftProfileSchema>;
export type PublicationProfile = z.output<typeof publicationProfileSchema>;
