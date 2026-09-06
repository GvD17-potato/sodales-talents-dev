export function createProfileSlugBase(name: string) {
  const normalized = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");

  return normalized.length >= 3 ? normalized : "talent";
}
export function createProfileSlugCandidate(base: string, attempt: number) {
  if (attempt === 0) return base;
  const suffix = `-${attempt + 1}`;
  return `${base.slice(0, 60 - suffix.length).replace(/-+$/g, "")}${suffix}`;
}
