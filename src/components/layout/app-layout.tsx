import { useState, type ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { TopBar } from "./top-bar";
import { cn } from "../ui/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <AppSidebar collapsed={collapsed} onToggle={toggleSidebar} />
      <div className={cn("min-h-screen transition-all duration-300", collapsed ? "ml-20" : "ml-72")}>
        <div className="sticky top-0 z-40 border-b border-border bg-background backdrop-blur supports-[backdrop-filter]:bg-background/95">
          <TopBar collapsed={collapsed} onToggleSidebar={toggleSidebar} />
        </div>
        <main className="flex-1 overflow-y-auto p-6">
          <div id="page-top" />
          <div id="page-content">{children}</div>
          <div id="page-bottom" />
        </main>
      </div>
    </div>
  );
}
