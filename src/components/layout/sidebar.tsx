"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BarChart3, 
  PackagePlus, 
  Store, 
  Plug, 
  Settings, 
  HelpCircle, 
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { APP_CONFIG } from "@/lib/config";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Products", href: "/products", icon: PackagePlus },
  { name: "Marketplaces", href: "/marketplaces", icon: Store },
  { name: "Integrations", href: "/integrations", icon: Plug },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Support", href: "/support", icon: HelpCircle },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    document.cookie = "auth_token=; path=/; max-age=0";
    
    // Redirect to home
    window.location.href = "/";
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "flex flex-col h-screen border-r bg-card/50 backdrop-blur-sm transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 bg-flame-gradient rounded-lg flex items-center justify-center shadow-glow-sm">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg">{APP_CONFIG.name}</p>
                <p className="text-xs text-muted-foreground">{APP_CONFIG.company}</p>
              </div>
            </motion.div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 bg-flame-gradient rounded-lg flex items-center justify-center shadow-glow-sm mx-auto">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-flame-gradient text-white shadow-glow-sm"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={cn("h-5 w-5", isCollapsed ? "" : "flex-shrink-0")} />
                {!isCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-2">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all duration-200",
            "hover:bg-destructive/10 text-destructive hover:text-destructive",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all duration-200",
            "hover:bg-muted text-muted-foreground",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span className="font-medium text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

