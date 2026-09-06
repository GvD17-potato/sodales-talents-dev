"use client";

import { Button } from "@sodales/ui/button";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { draftProfileSchema, type DraftProfile, type ProfileStatus } from "@/domain";
import {
  initialProfileActionState,
} from "@/features/talents/profile-action-state";
import { saveTalentProfileAction } from "@/features/talents/profile-actions";
import type { EditableTalentCategory } from "@/features/talents/profile-editor";

type Item<T> = T & { key: string };

const fieldClass =
  "min-h-12 w-full border border-graphite/40 bg-transparent px-3.5 text-base outline-none focus:border-violet focus:shadow-[0_0_0_1px_var(--sodales-violet)] disabled:cursor-not-allowed disabled:opacity-60";

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="mt-2 text-sm text-red-700">
      {errors[0]}
    </p>
  );
}

function statusGuidance(status: ProfileStatus) {
  if (status === "pending") {
    return "A saved change will withdraw this profile from review. A normalized no-op will keep it pending.";
  }
  if (status === "approved") {
    return "Changes to public content return this profile to review. Reordering existing skills or links does not.";
  }
  if (status === "hidden") {
    return "Saving never removes the hidden status. Use Resubmit for review from the overview when the profile is ready.";
  }
  return "You can save an incomplete draft. Submission readiness is checked separately.";
}

export function ProfileEditorForm({
  initialValues,
  initialStatus,
  categories,
}: {
  initialValues: DraftProfile;
  initialStatus: ProfileStatus;
  categories: EditableTalentCategory[];
}) {
  const [state, formAction, pending] = useActionState(
    saveTalentProfileAction,
    initialProfileActionState,
  );
  const [clientErrors, setClientErrors] = useState<Record<string, string[]>>({});
  const [bioLength, setBioLength] = useState(initialValues.bio?.length ?? 0);
  const nextKey = useRef(initialValues.skills.length + initialValues.links.length);
  const [skills, setSkills] = useState<Array<Item<{ name: string }>>>(() =>
    initialValues.skills.map((name, index) => ({ key: `skill-${index}`, name })),
  );
  const [links, setLinks] = useState<
    Array<Item<{ label: string; url: string }>>
  >(() =>
    initialValues.links.map((link, index) => ({
      key: `link-${index}`,
      ...link,
    })),
  );
  const fieldErrors = Object.keys(clientErrors).length
    ? clientErrors
    : (state.fieldErrors ?? {});
  const currentStatus = state.profileStatus ?? initialStatus;

  useEffect(() => {
    if (state.status === "success" && state.message) toast.success(state.message);
    if (state.status === "error" && state.message) toast.error(state.message);
  }, [state]);

  function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= items.length) return items;
    const next = [...items];
    [next[index], next[destination]] = [next[destination], next[index]];
    return next;
  }

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const labels = formData.getAll("portfolioLabel");
    const urls = formData.getAll("portfolioUrl");
    const result = draftProfileSchema.safeParse({
      displayName: formData.get("displayName"),
      slug: formData.get("slug"),
      headline: formData.get("headline"),
      bio: formData.get("bio"),
      location: formData.get("location"),
      categoryId: formData.get("categoryId"),
      skills: formData.getAll("skills"),
      links: labels.map((label, index) => ({ label, url: urls[index] ?? "" })),
    });
    if (result.success) {
      setClientErrors({});
      return;
    }
    event.preventDefault();
    const errors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const field = issue.path.map(String).join(".");
      if (field) (errors[field] ??= []).push(issue.message);
    }
    setClientErrors(errors);
  }

  return (
    <form action={formAction} onSubmit={validateBeforeSubmit} className="space-y-12">
      <div className="border border-border p-5 sm:p-7">
        <p className="text-sm leading-6 text-graphite">{statusGuidance(currentStatus)}</p>
      </div>

      <fieldset className="space-y-7">
        <legend className="font-display text-2xl font-semibold tracking-[-0.035em]">
          Profile details
        </legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-display-name" className="mb-2 block text-[13px] font-medium">
              Display name
            </label>
            <input
              id="profile-display-name"
              name="displayName"
              defaultValue={initialValues.displayName}
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              aria-invalid={Boolean(fieldErrors.displayName?.length)}
              aria-describedby={fieldErrors.displayName?.length ? "profile-display-name-error" : undefined}
              className={fieldClass}
            />
            <FieldError id="profile-display-name-error" errors={fieldErrors.displayName} />
          </div>
          <div>
            <label htmlFor="profile-slug" className="mb-2 block text-[13px] font-medium">
              Public profile slug
            </label>
            <div className="flex min-h-12 border border-graphite/40 focus-within:border-violet focus-within:shadow-[0_0_0_1px_var(--sodales-violet)]">
              <span className="flex items-center border-r border-border px-3 text-sm text-graphite" aria-hidden="true">
                /talents/
              </span>
              <input
                id="profile-slug"
                name="slug"
                defaultValue={initialValues.slug}
                required
                minLength={3}
                maxLength={60}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                aria-invalid={Boolean(fieldErrors.slug?.length)}
                aria-describedby={fieldErrors.slug?.length ? "profile-slug-error" : "profile-slug-hint"}
                className="min-w-0 flex-1 bg-transparent px-3.5 text-base outline-none"
              />
            </div>
            <p id="profile-slug-hint" className="mt-2 text-xs leading-5 text-graphite">
              Lowercase letters, numbers, and hyphens only.
            </p>
            <FieldError id="profile-slug-error" errors={fieldErrors.slug} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="profile-headline" className="mb-2 block text-[13px] font-medium">
              Headline <span className="font-normal text-graphite">— required to submit</span>
            </label>
            <input
              id="profile-headline"
              name="headline"
              defaultValue={initialValues.headline ?? ""}
              minLength={10}
              maxLength={120}
              aria-invalid={Boolean(fieldErrors.headline?.length)}
              aria-describedby={fieldErrors.headline?.length ? "profile-headline-error" : undefined}
              className={fieldClass}
            />
            <FieldError id="profile-headline-error" errors={fieldErrors.headline} />
          </div>
          <div className="sm:col-span-2">
            <div className="mb-2 flex items-center justify-between gap-4">
              <label htmlFor="profile-bio" className="text-[13px] font-medium">
                Biography <span className="font-normal text-graphite">— required to submit</span>
              </label>
              <span className="text-xs text-graphite">{bioLength}/2000</span>
            </div>
            <textarea
              id="profile-bio"
              name="bio"
              defaultValue={initialValues.bio ?? ""}
              minLength={50}
              maxLength={2000}
              rows={8}
              onChange={(event) => setBioLength(event.currentTarget.value.length)}
              aria-invalid={Boolean(fieldErrors.bio?.length)}
              aria-describedby={fieldErrors.bio?.length ? "profile-bio-error" : undefined}
              className={`${fieldClass} py-3`}
            />
            <FieldError id="profile-bio-error" errors={fieldErrors.bio} />
          </div>
          <div>
            <label htmlFor="profile-location" className="mb-2 block text-[13px] font-medium">
              Location <span className="font-normal text-graphite">— required to submit</span>
            </label>
            <input
              id="profile-location"
              name="location"
              defaultValue={initialValues.location ?? ""}
              minLength={2}
              maxLength={80}
              autoComplete="address-level2"
              aria-invalid={Boolean(fieldErrors.location?.length)}
              aria-describedby={fieldErrors.location?.length ? "profile-location-error" : undefined}
              className={fieldClass}
            />
            <FieldError id="profile-location-error" errors={fieldErrors.location} />
          </div>
          <div>
            <label htmlFor="profile-category" className="mb-2 block text-[13px] font-medium">
              Category <span className="font-normal text-graphite">— required to submit</span>
            </label>
            <select
              id="profile-category"
              name="categoryId"
              defaultValue={initialValues.categoryId ?? ""}
              aria-invalid={Boolean(fieldErrors.categoryId?.length)}
              aria-describedby={fieldErrors.categoryId?.length ? "profile-category-error" : undefined}
              className={fieldClass}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <FieldError id="profile-category-error" errors={fieldErrors.categoryId} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <legend className="font-display text-2xl font-semibold tracking-[-0.035em]">Skills</legend>
            <p className="mt-2 text-sm text-graphite">Up to 15 unique skills. At least one is required to submit.</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={skills.length >= 15}
            onClick={() => setSkills((items) => [...items, { key: `skill-new-${nextKey.current++}`, name: "" }])}
          >
            <Plus aria-hidden="true" size={16} /> Add skill
          </Button>
        </div>
        <div className="space-y-3">
          {skills.length ? skills.map((skill, index) => {
            const errorId = `profile-skill-${index}-error`;
            const errors = fieldErrors[`skills.${index}`] ?? (index === 0 ? fieldErrors.skills : undefined);
            return (
              <div key={skill.key} className="border border-border p-3">
                <label htmlFor={`profile-skill-${skill.key}`} className="sr-only">Skill {index + 1}</label>
                <div className="flex gap-2">
                  <input
                    id={`profile-skill-${skill.key}`}
                    name="skills"
                    defaultValue={skill.name}
                    maxLength={40}
                    aria-invalid={Boolean(errors?.length)}
                    aria-describedby={errors?.length ? errorId : undefined}
                    className={fieldClass}
                  />
                  <Button type="button" variant="quiet" aria-label={`Move skill ${index + 1} up`} disabled={index === 0} onClick={() => setSkills((items) => moveItem(items, index, -1))} className="shrink-0 px-3">
                    <ArrowUp aria-hidden="true" size={16} />
                  </Button>
                  <Button type="button" variant="quiet" aria-label={`Move skill ${index + 1} down`} disabled={index === skills.length - 1} onClick={() => setSkills((items) => moveItem(items, index, 1))} className="shrink-0 px-3">
                    <ArrowDown aria-hidden="true" size={16} />
                  </Button>
                  <Button type="button" variant="quiet" aria-label={`Remove skill ${index + 1}`} onClick={() => setSkills((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="shrink-0 px-3 text-red-700">
                    <Trash2 aria-hidden="true" size={16} />
                  </Button>
                </div>
                <FieldError id={errorId} errors={errors} />
              </div>
            );
          }) : (
            <p className="border border-dashed border-graphite/30 p-5 text-sm text-graphite">No skills added yet.</p>
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <legend className="font-display text-2xl font-semibold tracking-[-0.035em]">Portfolio links</legend>
            <p className="mt-2 text-sm text-graphite">Optional. Add up to 8 secure HTTPS destinations.</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={links.length >= 8}
            onClick={() => setLinks((items) => [...items, { key: `link-new-${nextKey.current++}`, label: "", url: "" }])}
          >
            <Plus aria-hidden="true" size={16} /> Add link
          </Button>
        </div>
        <div className="space-y-3">
          {links.length ? links.map((link, index) => {
            const labelErrors = fieldErrors[`links.${index}.label`];
            const urlErrors = fieldErrors[`links.${index}.url`];
            return (
              <div key={link.key} className="grid gap-3 border border-border p-4 sm:grid-cols-[0.7fr_1.3fr_auto] sm:items-start">
                <div>
                  <label htmlFor={`profile-link-label-${link.key}`} className="mb-2 block text-[13px] font-medium">Label</label>
                  <input id={`profile-link-label-${link.key}`} name="portfolioLabel" defaultValue={link.label} maxLength={60} aria-invalid={Boolean(labelErrors?.length)} aria-describedby={labelErrors?.length ? `profile-link-label-${index}-error` : undefined} className={fieldClass} />
                  <FieldError id={`profile-link-label-${index}-error`} errors={labelErrors} />
                </div>
                <div>
                  <label htmlFor={`profile-link-url-${link.key}`} className="mb-2 block text-[13px] font-medium">HTTPS URL</label>
                  <input id={`profile-link-url-${link.key}`} name="portfolioUrl" type="url" inputMode="url" defaultValue={link.url} placeholder="https://" aria-invalid={Boolean(urlErrors?.length)} aria-describedby={urlErrors?.length ? `profile-link-url-${index}-error` : undefined} className={fieldClass} />
                  <FieldError id={`profile-link-url-${index}-error`} errors={urlErrors} />
                </div>
                <div className="flex gap-1 sm:pt-7">
                  <Button type="button" variant="quiet" aria-label={`Move portfolio link ${index + 1} up`} disabled={index === 0} onClick={() => setLinks((items) => moveItem(items, index, -1))} className="px-3"><ArrowUp aria-hidden="true" size={16} /></Button>
                  <Button type="button" variant="quiet" aria-label={`Move portfolio link ${index + 1} down`} disabled={index === links.length - 1} onClick={() => setLinks((items) => moveItem(items, index, 1))} className="px-3"><ArrowDown aria-hidden="true" size={16} /></Button>
                  <Button type="button" variant="quiet" aria-label={`Remove portfolio link ${index + 1}`} onClick={() => setLinks((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="px-3 text-red-700"><Trash2 aria-hidden="true" size={16} /></Button>
                </div>
              </div>
            );
          }) : (
            <p className="border border-dashed border-graphite/30 p-5 text-sm text-graphite">No portfolio links added.</p>
          )}
        </div>
      </fieldset>

      <div className="sticky bottom-4 z-10 flex flex-col gap-4 border border-border bg-ivory/95 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className={`text-sm ${state.status === "error" ? "text-red-700" : "text-graphite"}`}>
          {state.message ?? "Changes are saved only when you select Save profile."}
        </p>
        <Button type="submit" disabled={pending} aria-busy={pending} className="shrink-0">
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
