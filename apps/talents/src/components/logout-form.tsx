import { Button } from "@sodales/ui/button";
import { signOutAction } from "@/features/auth/actions";

export function LogoutForm() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="secondary">
        Sign out
      </Button>
    </form>
  );
}
