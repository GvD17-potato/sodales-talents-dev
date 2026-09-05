import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "quiet";
};

const variants = {
  primary:
    "border border-violet bg-violet text-primary-foreground hover:bg-violet-deep",
  secondary:
    "border border-obsidian bg-transparent text-obsidian hover:bg-obsidian hover:text-ivory",
  quiet:
    "border border-transparent bg-transparent text-obsidian hover:border-border hover:bg-white/50",
};

export function Button({
  asChild = false,
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      className={`inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
