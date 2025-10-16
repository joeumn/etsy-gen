"use client";

import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { RefreshCw, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onMobileMenuToggle?: () => void;
}

export function Topbar({ onRefresh, isRefreshing = false, onMobileMenuToggle }: TopbarProps) {
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
      className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40"
    >
      {/* Left side - Mobile menu + Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onMobileMenuToggle}
          className="lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <h2 className="text-lg md:text-xl font-semibold truncate">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h2>
      </div>

      {/* Right side - actions */}
      <div className="flex items-center gap-2 md:gap-3">
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
          <Avatar className="h-8 w-8 md:h-9 md:w-9 border-2 border-flame-500/20">
            <AvatarFallback className="bg-flame-gradient text-white font-semibold text-xs md:text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          {user && (
            <div className="hidden xl:block">
              <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
              <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

