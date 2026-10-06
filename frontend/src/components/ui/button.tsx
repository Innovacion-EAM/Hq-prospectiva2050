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
        // Antes era `bg-lime-hot text-paper`, que daba 1,95:1: el texto blanco
        // sobre ese lima era ilegible y el botón quedaba inutilizable. Ahora el
        // fondo es `lime-btn` (#3f6b0e), que con blanco da 6,32:1. El nombre
        // `hot` se conserva porque aparece en varios `<Button variant="hot">` y
        // renombrarlo sería romperlos sin ganar nada.
        hot: "bg-lime-btn text-white hover:brightness-110",
        // Sin ningún color, para los botones cuyo color elige el editor desde el
        // panel (portada → Ajustes → Home) y llega en `className`. Con cualquier
        // otra variante se mezclan: `tailwind-merge` resuelve bien los `bg-*` y
        // los `text-*` duplicados, pero no puede saber que `hover:bg-lime-ink` y
        // `hover:brightness-110` son del mismo botón y se quedan **los dos** —
        // al pasar el ratón el fondo se oscurecía y además se aclaraba.
        pintado: "",
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
