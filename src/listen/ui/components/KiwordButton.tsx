import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-kw-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kw-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-kw-primary-500 text-kw-white hover:bg-kw-primary-600 shadow-kw-sm",
        secondary:
          "bg-kw-white text-kw-primary-600 border-2 border-kw-primary-500 hover:bg-kw-primary-50",
        ghost: "hover:bg-kw-primary-50 text-kw-primary-600",
        danger: "bg-kw-error text-kw-white hover:bg-kw-error/90 shadow-kw-sm",
        outline:
          "border border-kw-border bg-transparent hover:bg-kw-bg-hover text-kw-text-primary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-kw-md px-3 text-xs",
        lg: "h-12 rounded-kw-xl px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const KiwordButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
KiwordButton.displayName = "KiwordButton";

export { KiwordButton, buttonVariants };
