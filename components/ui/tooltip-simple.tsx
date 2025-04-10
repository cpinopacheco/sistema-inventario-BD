"use client";

import type React from "react";
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
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
    <TooltipProvider>
      <TooltipRoot>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={`text-xs backdrop-blur-md bg-background/80 border border-border/50 shadow-lg dark:bg-background/60 dark:border-white/10 ${className}`}
        >
          {text}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}
