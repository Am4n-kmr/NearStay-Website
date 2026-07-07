import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const variantStyles = {
  default: "border-transparent bg-primary/10 text-primary hover:bg-primary/20",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  destructive: "border-transparent bg-destructive/10 text-destructive",
  outline: "text-foreground border border-border",
};

const Badge = forwardRef(({ className, variant = "default", ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };