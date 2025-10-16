"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "flame" | "ocean" | "gold";
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  size = "md",
  variant = "flame",
  className,
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const variantClasses = {
    default: "text-foreground",
    flame: "text-flame-500",
    ocean: "text-ocean-500",
    gold: "text-gold-500",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2
          className={cn(sizeClasses[size], variantClasses[variant])}
        />
      </motion.div>
      {text && (
        <motion.p
          className="mt-2 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  variant?: "default" | "shimmer";
}

export function LoadingSkeleton({
  className,
  variant = "shimmer",
}: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-muted rounded-md",
        variant === "shimmer" && "shimmer",
        className
      )}
    />
  );
}

export function LoadingCard() {
  return (
    <div className="p-6 space-y-4">
      <LoadingSkeleton className="h-4 w-1/4" />
      <LoadingSkeleton className="h-8 w-1/2" />
      <LoadingSkeleton className="h-3 w-full" />
      <LoadingSkeleton className="h-3 w-3/4" />
    </div>
  );
}

