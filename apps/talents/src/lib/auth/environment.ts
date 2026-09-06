import "server-only";

function requireEnvironmentValue(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Required server environment variable ${name} is not configured.`);
  }
  return value;
}
export function getNeonAuthEnvironment() {
  const baseUrl = requireEnvironmentValue("NEON_AUTH_BASE_URL");
  const cookieSecret = requireEnvironmentValue("NEON_AUTH_COOKIE_SECRET");

  if (!URL.canParse(baseUrl) || new URL(baseUrl).protocol !== "https:") {
    throw new Error("NEON_AUTH_BASE_URL must be a valid HTTPS URL.");
  }
  if (cookieSecret.length < 32) {
    throw new Error("NEON_AUTH_COOKIE_SECRET must contain at least 32 characters.");
  }

  return { baseUrl, cookieSecret };
}
