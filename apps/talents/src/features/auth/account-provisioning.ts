import "server-only";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { talentProfile, userRole } from "@/db/schema";
import type { UserRole } from "@/domain";
import type {
  ApplicationAccount,
  AuthIdentity,
} from "./workflows";
import { initialDraftProfileValues } from "./provisioning-policy";

const authUserIdSchema = z.uuid();
const maximumSlugAttempts = 100;

export async function getApplicationAccount(
  rawUserId: string,
): Promise<ApplicationAccount | null> {
  const userId = authUserIdSchema.parse(rawUserId);
  const [roleRow] = await db
    .select({ role: userRole.role })
    .from(userRole)
    .where(eq(userRole.userId, userId))
    .limit(1);

  if (!roleRow) return null;
  if (roleRow.role === "admin") return { role: "admin", profileId: null };

  const [profileRow] = await db
    .select({ id: talentProfile.id })
    .from(talentProfile)
    .where(eq(talentProfile.userId, userId))
    .limit(1);

  return { role: "talent", profileId: profileRow?.id ?? null };
}

export async function getRoleForUserId(
  userId: string,
): Promise<UserRole | null> {
  return (await getApplicationAccount(userId))?.role ?? null;
}

export async function reconcileApplicationAccount(
  identity: AuthIdentity,
): Promise<ApplicationAccount> {
  const userId = authUserIdSchema.parse(identity.id);

  return db.transaction(async (transaction) => {
    await transaction
      .insert(userRole)
      .values({ userId, role: "talent" })
      .onConflictDoNothing({ target: userRole.userId });

    const [roleRow] = await transaction
      .select({ role: userRole.role })
      .from(userRole)
      .where(eq(userRole.userId, userId))
      .limit(1);

    if (!roleRow) {
      throw new Error("Application role provisioning was not verified.");
    }

    if (roleRow.role === "admin") {
      return { role: "admin", profileId: null };
    }

    let [profileRow] = await transaction
      .select({ id: talentProfile.id })
      .from(talentProfile)
      .where(eq(talentProfile.userId, userId))
      .limit(1);

    for (
      let attempt = 0;
      !profileRow && attempt < maximumSlugAttempts;
      attempt += 1
    ) {
      const [inserted] = await transaction
        .insert(talentProfile)
        .values({
          ...initialDraftProfileValues(identity, attempt),
          userId,
        })
        .onConflictDoNothing()
        .returning({ id: talentProfile.id });

      if (inserted) profileRow = inserted;
      if (!profileRow) {
        [profileRow] = await transaction
          .select({ id: talentProfile.id })
          .from(talentProfile)
          .where(eq(talentProfile.userId, userId))
          .limit(1);
      }
    }

    if (!profileRow) {
      throw new Error("Draft profile provisioning was not verified.");
    }

    return { role: "talent", profileId: profileRow.id };
  });
}
