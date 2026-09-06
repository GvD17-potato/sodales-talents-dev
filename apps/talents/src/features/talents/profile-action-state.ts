import type { ProfileStatus } from "@/domain";

export type ProfileActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
  profileStatus?: ProfileStatus;
};

export const initialProfileActionState: ProfileActionState = {
  status: "idle",
};
