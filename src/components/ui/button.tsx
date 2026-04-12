"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-movApp-accent disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "bg-movApp-accent text-white hover:bg-movApp-accentHover",
        variant === "secondary" &&
          "bg-movApp-subtle text-movApp-ink ring-1 ring-movApp-border hover:bg-movApp-border/35",
        variant === "ghost" &&
          "text-movApp-muted hover:bg-movApp-subtle hover:text-movApp-ink",
        variant === "outline" &&
          "border border-movApp-border bg-movApp-paper text-movApp-ink hover:border-movApp-accent/45 hover:bg-movApp-subtle",
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
