import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] active:scale-95",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 active:scale-95",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary/10 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] active:scale-95",
        secondary:
          "bg-secondary text-secondary-foreground shadow-lg hover:bg-secondary/80 hover:shadow-[0_0_30px_hsl(var(--secondary)/0.5)] active:scale-95",
        ghost: 
          "hover:bg-muted hover:text-foreground active:scale-95",
        link: 
          "text-primary underline-offset-4 hover:underline",
        neon:
          "bg-gradient-to-r from-primary via-purple-500 to-secondary text-white shadow-lg hover:shadow-[0_0_40px_hsl(var(--primary)/0.6),0_0_60px_hsl(var(--secondary)/0.4)] active:scale-95",
        glass:
          "bg-card/50 backdrop-blur-lg border border-border/50 text-foreground hover:bg-card/70 hover:border-primary/50 active:scale-95",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-2xl px-10 text-lg",
        xl: "h-16 rounded-2xl px-12 text-xl",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
