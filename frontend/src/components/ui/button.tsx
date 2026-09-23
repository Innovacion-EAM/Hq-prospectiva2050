import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-display font-semibold tracking-wide tap-scale whitespace-nowrap transition-[background-color,color,box-shadow,opacity] duration-200 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        lime: "bg-lime text-lime-fg hover:bg-lime-deep",
        ink: "bg-ink text-paper hover:bg-ink-mid",
        ghost: "bg-transparent text-paper hover:bg-paper/10",
        outline: "border border-mist bg-paper text-ink hover:bg-fog",
        hot: "bg-lime-hot text-paper hover:bg-lime-deep",
      },
      size: {
        sm: "h-9 rounded-pill px-4 text-xs",
        md: "h-10 rounded-pill px-5 text-sm",
        lg: "h-12 rounded-pill px-6 text-sm",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: { variant: "lime", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}
