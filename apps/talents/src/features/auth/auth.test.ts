import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_AUTH_SKIP_ROUTES,
  shouldProtectRoute,
} from "@neondatabase/auth/server";
import {
  authorizeApplicationUser,
  signUpSchema,
  type SignInInput,
  type SignUpInput,
  type UserRole,
} from "../../domain";
import { initialDraftProfileValues } from "./provisioning-policy";
import {
  authenticateAccount,
  registerTalent,
  terminateSession,
  type AccountProvisioner,
  type AuthAttempt,
  type AuthIdentity,
  type AuthProviderGateway,
} from "./workflows";

const identity: AuthIdentity = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "talent@example.test",
  name: "Lena Ortiz",
};

const signUpInput: SignUpInput = {
  name: "Lena Ortiz",
  email: identity.email,
  password: "correct-horse-battery-staple",
};

const signInInput: SignInInput = {
  email: identity.email,
  password: signUpInput.password,
};

class FakeAuthProvider implements AuthProviderGateway {
  currentIdentity: AuthIdentity | null = identity;
  signOutCount = 0;
  signUpResult: AuthAttempt = { ok: true, identity };
  signInResult: AuthAttempt = { ok: true, identity };

  async signUp() {
    return this.signUpResult;
  }

  async signIn() {
    return this.signInResult;
  }

  async getIdentity() {
    return this.currentIdentity;
  }

  async signOut() {
    this.signOutCount += 1;
    this.currentIdentity = null;
  }
}

class InMemoryProvisioner implements AccountProvisioner {
  roles = new Map<string, UserRole>();
  profiles = new Map<string, ReturnType<typeof initialDraftProfileValues>>();
  roleInsertions = 0;
  profileInsertions = 0;

  async reconcile(authIdentity: AuthIdentity) {
    let role = this.roles.get(authIdentity.id);
    if (!role) {
      role = "talent";
      this.roles.set(authIdentity.id, role);
      this.roleInsertions += 1;
    }
    if (role === "admin") return { role, profileId: null };

    let profile = this.profiles.get(authIdentity.id);
    if (!profile) {
      profile = initialDraftProfileValues(authIdentity);
      this.profiles.set(authIdentity.id, profile);
      this.profileInsertions += 1;
    }
    return { role, profileId: `profile-${profile.userId}` };
  }
}

const noWait = async () => undefined;

test("public sign-up validation cannot request an admin role", () => {
  assert.equal(
    signUpSchema.safeParse({ ...signUpInput, role: "admin" }).success,
    false,
  );
});
test("initial sign-up profile is an incomplete draft owned by the Auth user", () => {
  assert.deepEqual(initialDraftProfileValues(identity), {
    userId: identity.id,
    displayName: "Lena Ortiz",
    slug: "lena-ortiz",
    headline: null,
    bio: null,
    location: null,
    categoryId: null,
    status: "draft",
  });
});

test("sign-up provisions a talent role and draft profile before redirect", async () => {
  const provider = new FakeAuthProvider();
  const provisioner = new InMemoryProvisioner();

  const result = await registerTalent(
    signUpInput,
    provider,
    provisioner,
    noWait,
  );

  assert.deepEqual(result, {
    ok: true,
    role: "talent",
    destination: "/dashboard",
  });
  assert.equal(provisioner.roles.get(identity.id), "talent");
  assert.equal(provisioner.profiles.get(identity.id)?.status, "draft");
});

test("repeated provisioning does not duplicate role or profile state", async () => {
  const provider = new FakeAuthProvider();
  const provisioner = new InMemoryProvisioner();

  await registerTalent(signUpInput, provider, provisioner, noWait);
  await registerTalent(signUpInput, provider, provisioner, noWait);

  assert.equal(provisioner.roles.size, 1);
  assert.equal(provisioner.profiles.size, 1);
  assert.equal(provisioner.roleInsertions, 1);
  assert.equal(provisioner.profileInsertions, 1);
});

test("login resolves an authenticated talent to the dashboard", async () => {
  const result = await authenticateAccount(
    signInInput,
    new FakeAuthProvider(),
    new InMemoryProvisioner(),
    noWait,
  );
  assert.deepEqual(result, {
    ok: true,
    role: "talent",
    destination: "/dashboard",
  });
});

test("login preserves an existing admin role and resolves to admin", async () => {
  const provisioner = new InMemoryProvisioner();
  provisioner.roles.set(identity.id, "admin");

  const result = await authenticateAccount(
    signInInput,
    new FakeAuthProvider(),
    provisioner,
    noWait,
  );
  assert.deepEqual(result, {
    ok: true,
    role: "admin",
    destination: "/admin",
  });
  assert.equal(provisioner.profiles.size, 0);
});

test("missing application profile fails closed and terminates the session", async () => {
  const provider = new FakeAuthProvider();
  const provisioner: AccountProvisioner = {
    async reconcile() {
      return { role: "talent", profileId: null };
    },
  };

  const result = await authenticateAccount(
    signInInput,
    provider,
    provisioner,
    noWait,
  );
  assert.equal(result.ok, false);
  assert.equal(provider.signOutCount, 1);
  assert.equal(provider.currentIdentity, null);
});

test("identity lookup retries when Auth response propagation is delayed", async () => {
  const provider = new FakeAuthProvider();
  let lookups = 0;
  provider.signUpResult = { ok: true, identity: null };
  provider.getIdentity = async () => {
    lookups += 1;
    return lookups === 2 ? identity : null;
  };

  const result = await registerTalent(
    signUpInput,
    provider,
    new InMemoryProvisioner(),
    noWait,
  );
  assert.equal(result.ok, true);
  assert.equal(lookups, 2);
});

test("logout invalidates the expected application identity", async () => {
  const provider = new FakeAuthProvider();
  assert.equal(await terminateSession(provider), null);
  assert.equal(provider.signOutCount, 1);
});

test("server authorization denies unauthenticated protected access", () => {
  assert.equal(
    authorizeApplicationUser({
      authenticated: false,
      role: null,
      hasTalentProfile: false,
      allowedRoles: ["talent"],
    }),
    "unauthenticated",
  );
});

test("talent is allowed on talent routes and denied on admin routes", () => {
  const base = {
    authenticated: true,
    role: "talent" as const,
    hasTalentProfile: true,
  };
  assert.equal(
    authorizeApplicationUser({ ...base, allowedRoles: ["talent"] }),
    "allow",
  );
  assert.equal(
    authorizeApplicationUser({ ...base, allowedRoles: ["admin"] }),
    "forbidden",
  );
});

test("admin is allowed on admin routes", () => {
  assert.equal(
    authorizeApplicationUser({
      authenticated: true,
      role: "admin",
      hasTalentProfile: false,
      allowedRoles: ["admin"],
    }),
    "allow",
  );
});

test("Neon middleware leaves anonymous Auth API endpoints unprotected", () => {
  assert.equal(
    shouldProtectRoute(
      "/api/auth/sign-up/email",
      DEFAULT_AUTH_SKIP_ROUTES,
    ),
    false,
  );
  assert.equal(
    shouldProtectRoute(
      "/api/auth/sign-in/email",
      DEFAULT_AUTH_SKIP_ROUTES,
    ),
    false,
  );
});
