"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";

interface AdvancedStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  delay?: number;
  gradient?: "flame" | "ocean" | "gold" | "forge";
  className?: string;
}

export function AdvancedStatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  delay = 0,
  gradient = "flame",
  className,
}: AdvancedStatCardProps) {
  const gradientClasses = {
    flame: "from-flame-500 to-flame-600",
    ocean: "from-ocean-500 to-ocean-600",
    gold: "from-gold-500 to-gold-600",
    forge: "from-ocean-500 via-flame-500 to-gold-500",
  };

  const isPositiveTrend = trend?.isPositive ?? (trend && trend.value > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <Card className={cn("overflow-hidden card-hover", className)}>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1">
                {title}
              </p>
              <motion.h3
                className="text-2xl md:text-3xl font-bold truncate"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: delay + 0.2 }}
              >
                {value}
              </motion.h3>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            <motion.div
              className={cn(
                "p-2 md:p-3 rounded-xl bg-gradient-to-br text-white flex-shrink-0 ml-2",
                gradientClasses[gradient]
              )}
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: delay + 0.1,
              }}
            >
              <Icon className="h-5 w-5 md:h-6 md:w-6" />
            </motion.div>
          </div>
          
          {trend && (
            <motion.div
              className="flex items-center text-xs md:text-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: delay + 0.3 }}
            >
              <div
                className={cn(
                  "flex items-center font-medium",
                  isPositiveTrend ? "text-green-600" : "text-red-600"
                )}
              >
                <span>{isPositiveTrend ? "↑" : "↓"}</span>
                <span className="ml-1">{Math.abs(trend.value)}%</span>
              </div>
              <span className="text-muted-foreground ml-2 truncate">{trend.label}</span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

