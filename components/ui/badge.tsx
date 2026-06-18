"use client"

import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider whitespace-nowrap [&>svg]:size-3 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-brand-subtle text-brand border-brand/15",
        secondary: "bg-background-subtle text-foreground-muted border-border",
        success: "bg-success-subtle text-success border-success/20",
        warning: "bg-warning-subtle text-warning border-warning/20",
        destructive: "bg-danger-subtle text-danger border-danger/20",
        danger: "bg-danger-subtle text-danger border-danger/20",
        outline: "bg-background-elevated text-foreground-muted border-border",
        ghost: "bg-transparent text-foreground-muted border-transparent hover:bg-background-subtle",
        link: "text-brand underline-offset-4 hover:underline border-transparent bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
