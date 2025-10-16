"use client";

import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { RefreshCw, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Topbar({ onRefresh, isRefreshing = false }: TopbarProps) {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'U';

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 flex items-center justify-between sticky top-0 z-40"
    >
      {/* Left side - could add breadcrumbs or search */}
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h2>
      </div>

      {/* Right side - actions */}
      <div className="flex items-center gap-3">
        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          <span className="hidden md:inline">Refresh</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-flame-500 rounded-full" />
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-3 border-l">
          <Avatar className="h-9 w-9 border-2 border-flame-500/20">
            <AvatarFallback className="bg-flame-gradient text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {user && (
            <div className="hidden lg:block">
              <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
              <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

