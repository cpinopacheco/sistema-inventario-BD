"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const TooltipRoot = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { TooltipRoot, TooltipTrigger, TooltipContent, TooltipProvider };
import {
  TooltipProvider as TooltipProviderSimple,
  TooltipRoot as TooltipRootSimple,
  TooltipTrigger as TooltipTriggerSimple,
  TooltipContent as TooltipContentSimple,
} from "@/components/ui/tooltip";

interface TooltipSimpleProps {
  text: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
}

export function TooltipSimple({
  text,
  children,
  side = "top",
  align = "center",
  className = "",
}: TooltipSimpleProps) {
  return (
    <TooltipProviderSimple>
      <TooltipRootSimple>
        <TooltipTriggerSimple asChild>{children}</TooltipTriggerSimple>
        <TooltipContentSimple
          side={side}
          align={align}
          className={`text-xs backdrop-blur-md bg-background/80 border border-border/50 shadow-lg dark:bg-background/60 dark:border-white/10 ${className}`}
        >
          {text}
        </TooltipContentSimple>
      </TooltipRootSimple>
    </TooltipProviderSimple>
  );
}
