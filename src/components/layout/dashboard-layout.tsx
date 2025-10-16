"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useToast } from "@/components/ui/toast";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { addToast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Refresh dashboard data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      addToast({
        type: "success",
        title: "Data refreshed",
        description: "Dashboard data has been updated",
      });
    } catch (error) {
      addToast({
        type: "error",
        title: "Refresh failed",
        description: "Could not refresh data. Please try again.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Sidebar */}
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar 
          onRefresh={handleRefresh} 
          isRefreshing={isRefreshing}
          onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

