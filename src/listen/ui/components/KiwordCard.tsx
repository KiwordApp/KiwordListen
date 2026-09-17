import * as React from "react";
import { cn } from "../utils/cn";

const KiwordCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-kw-xl border border-kw-border bg-kw-bg-card text-kw-text-primary shadow-kw-sm",
      className,
    )}
    {...props}
  />
));
KiwordCard.displayName = "KiwordCard";

const KiwordCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
KiwordCardHeader.displayName = "KiwordCardHeader";

const KiwordCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
KiwordCardTitle.displayName = "KiwordCardTitle";

const KiwordCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-kw-text-secondary", className)}
    {...props}
  />
));
KiwordCardDescription.displayName = "KiwordCardDescription";

const KiwordCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
KiwordCardContent.displayName = "KiwordCardContent";

const KiwordCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
KiwordCardFooter.displayName = "KiwordCardFooter";

export {
  KiwordCard,
  KiwordCardHeader,
  KiwordCardFooter,
  KiwordCardTitle,
  KiwordCardDescription,
  KiwordCardContent,
};
