export type AuthField = "name" | "email" | "password";

export type AuthActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<AuthField, string[]>>;
};
export const initialAuthActionState: AuthActionState = { status: "idle" };
