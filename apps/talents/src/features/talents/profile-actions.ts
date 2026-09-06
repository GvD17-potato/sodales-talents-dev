"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import type { ProfileActionState } from "./profile-action-state";
import {
  saveTalentProfileForUser,
  submitTalentProfileForReview,
} from "./profile-editor";

function formInput(formData: FormData) {
  const labels = formData.getAll("portfolioLabel");
  const urls = formData.getAll("portfolioUrl");
  const linkCount = Math.max(labels.length, urls.length);

  return {
    displayName: formData.get("displayName"),
    slug: formData.get("slug"),
    headline: formData.get("headline"),
    bio: formData.get("bio"),
    location: formData.get("location"),
    categoryId: formData.get("categoryId"),
    skills: formData.getAll("skills").map(String),
    links: Array.from({ length: linkCount }, (_, index) => ({
      label: String(labels[index] ?? ""),
      url: String(urls[index] ?? ""),
    })),
  };
}

function fieldErrors(
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }> = [],
) {
  const errors: Record<string, string[]> = {};
  for (const issue of issues) {
    const field = issue.path.map(String).join(".");
    if (!field) continue;
    (errors[field] ??= []).push(issue.message);
  }
  return errors;
}

function revalidateProfilePaths(slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/talents");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  for (const slug of new Set(slugs)) revalidatePath(`/talents/${slug}`);
}

export async function saveTalentProfileAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const currentUser = await requireRole("talent");
  const result = await saveTalentProfileForUser(
    currentUser.id,
    formInput(formData),
  );

  if (!result.ok) {
    if (result.reason === "validation") {
      return {
        status: "error",
        message: "Check the highlighted profile fields and try again.",
        fieldErrors: fieldErrors(result.issues),
      };
    }
    if (result.reason === "slug-taken") {
      return {
        status: "error",
        message: "That public profile slug is already in use.",
        fieldErrors: { slug: ["Choose a different public profile slug."] },
      };
    }
    if (result.reason === "category-not-found") {
      return {
        status: "error",
        message: "The selected category is no longer available.",
        fieldErrors: { categoryId: ["Select an existing category."] },
      };
    }
    return {
      status: "error",
      message:
        result.reason === "profile-not-found"
          ? "Your talent profile could not be found."
          : "Your profile could not be saved. Please try again.",
    };
  }

  if (result.classification === "no-op") {
    return {
      status: "success",
      message: "No profile changes were detected.",
      profileStatus: result.status,
    };
  }

  revalidateProfilePaths([result.previousSlug, result.slug]);
  const transitionMessage =
    result.status === "pending"
      ? "Profile saved and returned to review."
      : result.status === "draft"
        ? "Profile saved as a draft. Your previous submission was withdrawn."
        : result.status === "hidden"
          ? "Profile saved. It remains hidden until you resubmit it."
          : "Profile saved.";
  return {
    status: "success",
    message: transitionMessage,
    profileStatus: result.status,
  };
}

export async function submitTalentProfileAction(
  _previousState: ProfileActionState,
  _formData: FormData,
): Promise<ProfileActionState> {
  void _previousState;
  void _formData;
  const currentUser = await requireRole("talent");
  const result = await submitTalentProfileForReview(currentUser.id);

  if (!result.ok) {
    if (result.reason === "publication-incomplete") {
      return {
        status: "error",
        message: "Complete the required profile fields before submitting.",
        fieldErrors: fieldErrors(result.issues),
        profileStatus: result.status,
      };
    }
    if (result.reason === "transition-not-allowed") {
      return {
        status: "error",
        message:
          result.status === "pending"
            ? "This profile is already under review."
            : "This profile cannot be submitted from its current status.",
        profileStatus: result.status,
      };
    }
    return {
      status: "error",
      message:
        result.reason === "profile-not-found"
          ? "Your talent profile could not be found."
          : "Your profile could not be submitted. Please try again.",
    };
  }

  revalidateProfilePaths([result.slug]);
  return {
    status: "success",
    message: "Profile submitted for review.",
    profileStatus: result.status,
  };
}
