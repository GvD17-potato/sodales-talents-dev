import type { SignInInput, SignUpInput, UserRole } from "@/domain";

export type AuthIdentity = {
  id: string;
  email: string;
  name: string | null;
};

export type AuthAttempt =
  | { ok: true; identity: AuthIdentity | null }
  | { ok: false; message: string };

export type ApplicationAccount = {
  role: UserRole;
  profileId: string | null;
};

export interface AuthProviderGateway {
  signUp(input: SignUpInput): Promise<AuthAttempt>;
  signIn(input: SignInInput): Promise<AuthAttempt>;
  getIdentity(): Promise<AuthIdentity | null>;
  signOut(): Promise<void>;
}

export interface AccountProvisioner {
  reconcile(identity: AuthIdentity): Promise<ApplicationAccount>;
}

export type AuthWorkflowResult =
  | { ok: true; role: UserRole; destination: "/dashboard" | "/admin" }
  | { ok: false; message: string };

const identityRetryDelays = [0, 50, 150] as const;

async function resolveIdentity(
  initialIdentity: AuthIdentity | null,
  provider: AuthProviderGateway,
  wait: (milliseconds: number) => Promise<void>,
) {
  if (initialIdentity) return initialIdentity;

  for (const delay of identityRetryDelays) {
    if (delay > 0) await wait(delay);
    try {
      const identity = await provider.getIdentity();
      if (identity) return identity;
    } catch {
      // A bounded retry covers transient session propagation/network failure.
    }
  }

  return null;
}

async function completeAuthentication(
  attempt: AuthAttempt,
  provider: AuthProviderGateway,
  provisioner: AccountProvisioner,
  wait: (milliseconds: number) => Promise<void>,
): Promise<AuthWorkflowResult> {
  if (!attempt.ok) return attempt;

  const identity = await resolveIdentity(attempt.identity, provider, wait);
  if (!identity) {
    await provider.signOut().catch(() => undefined);
    return {
      ok: false,
      message:
        "Authentication succeeded, but the account identity could not be verified. Please try again.",
    };
  }

  try {
    const account = await provisioner.reconcile(identity);
    if (account.role === "talent" && !account.profileId) {
      throw new Error("Talent profile provisioning was not verified.");
    }
    return {
      ok: true,
      role: account.role,
      destination: account.role === "admin" ? "/admin" : "/dashboard",
    };
  } catch {
    await provider.signOut().catch(() => undefined);
    return {
      ok: false,
      message:
        "Your account was authenticated, but its application setup could not be completed. Please try signing in again.",
    };
  }
}

const defaultWait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export async function registerTalent(
  input: SignUpInput,
  provider: AuthProviderGateway,
  provisioner: AccountProvisioner,
  wait = defaultWait,
) {
  return completeAuthentication(
    await provider.signUp(input),
    provider,
    provisioner,
    wait,
  );
}

export async function authenticateAccount(
  input: SignInInput,
  provider: AuthProviderGateway,
  provisioner: AccountProvisioner,
  wait = defaultWait,
) {
  return completeAuthentication(
    await provider.signIn(input),
    provider,
    provisioner,
    wait,
  );
}

export async function terminateSession(provider: AuthProviderGateway) {
  await provider.signOut();
  return null;
}
