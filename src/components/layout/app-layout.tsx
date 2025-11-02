"use client";

import { type ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { TopBar } from "./top-bar";
import { SidebarProvider, SidebarInset } from "../ui/sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="relative min-h-screen w-full flex bg-background text-foreground">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col md:pl-64 xl:pl-72 transition-[padding] duration-200 ease-in-out">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
