import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Content type variants
        monster: "border-transparent bg-content-monster/20 text-content-monster border-content-monster/40",
        subclass: "border-transparent bg-content-subclass/20 text-content-subclass border-content-subclass/40",
        spell: "border-transparent bg-content-spell/20 text-content-spell border-content-spell/40",
        item: "border-transparent bg-content-item/20 text-content-item border-content-item/40",
        feat: "border-transparent bg-content-feat/20 text-content-feat border-content-feat/40",
        subrace: "border-transparent bg-content-subrace/20 text-content-subrace border-content-subrace/40",
        magic_item: "border-content-magic_item/40 bg-content-magic_item/20 text-content-magic_item",
        npc: "border-content-npc bg-content-npc/10 text-content-npc",
        // Article type variants
        "design-notes": "border-transparent bg-article-design/20 text-article-design border-article-design/40",
        "dev-diaries": "border-transparent bg-article-dev/20 text-article-dev border-article-dev/40",
        "world-building": "border-transparent bg-article-art/20 text-article-art border-article-art/40",
        "lore-essays": "border-transparent bg-article-lore/20 text-article-lore border-article-lore/40",
        // Product status variants
        "product-available": "border-transparent bg-product-available/20 text-product-available border-product-available/40",
        "product-released": "border-transparent bg-product-released/20 text-product-released border-product-released/40",
        "product-kickstarter": "border-transparent bg-product-kickstarter/20 text-product-kickstarter border-product-kickstarter/40",
        "product-development": "border-transparent bg-product-development/20 text-product-development border-product-development/40",
        "product-planned": "border-transparent bg-product-planned/20 text-product-planned border-product-planned/40",
        // goal variants
        "unlocked": "border-transparent bg-goal-unlocked/20 text-goal-unlocked border-goal-unlocked/40",
        "locked": "border-transparent bg-goal-locked/20 text-goal-locked border-goal-locked/40", // FIXED
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
