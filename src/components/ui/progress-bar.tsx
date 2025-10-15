"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: "default" | "flame" | "ocean" | "gold";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  variant = "flame",
  size = "md",
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  const variantClasses = {
    default: "bg-primary",
    flame: "bg-gradient-to-r from-flame-500 to-flame-600",
    ocean: "bg-gradient-to-r from-ocean-500 to-ocean-600",
    gold: "bg-gradient-to-r from-gold-500 to-gold-600",
  };

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {label || `${percentage.toFixed(0)}%`}
          </span>
          <span className="text-sm text-muted-foreground">
            {value} / {max}
          </span>
        </div>
      )}
      <div className={cn("w-full bg-muted rounded-full overflow-hidden", sizeClasses[size])}>
        <motion.div
          className={cn("h-full rounded-full", variantClasses[variant])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: "default" | "flame" | "ocean" | "gold";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = "flame",
  showLabel = true,
  label,
  className,
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    default: "#2080c0",
    flame: "#ff6b22",
    ocean: "#2d9cdb",
    gold: "#ffc400",
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorClasses[variant]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeInOut" }}
          strokeDasharray={circumference}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">
            {label || `${percentage.toFixed(0)}%`}
          </span>
          {!label && (
            <span className="text-sm text-muted-foreground">
              {value}/{max}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

