import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-slate-100 bg-white text-slate-950 shadow-sm transition-all hover:shadow-md",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export { Card };
