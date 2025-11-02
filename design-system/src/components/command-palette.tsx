import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Store,
  BarChart3,
  Settings,
  Sparkles,
  Activity,
  FileText,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "../lib/theme-context";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const pages = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard", keywords: ["home", "overview"] },
    { name: "Trends", icon: TrendingUp, path: "/trends", keywords: ["scan", "market", "niches"] },
    { name: "Products", icon: Package, path: "/products", keywords: ["items", "generated", "ai"] },
    { name: "Marketplaces", icon: Store, path: "/marketplaces", keywords: ["etsy", "shopify", "amazon"] },
    { name: "Analytics", icon: BarChart3, path: "/analytics", keywords: ["stats", "performance", "metrics"] },
    { name: "Settings", icon: Settings, path: "/settings", keywords: ["preferences", "account", "profile"] },
  ];

  const actions = [
    { name: "Scan for Trends", icon: Activity, action: () => navigate("/trends") },
    { name: "Generate Product", icon: Sparkles, action: () => navigate("/products") },
    { name: "View Reports", icon: FileText, action: () => navigate("/analytics") },
  ];

  const handleSelect = (callback: () => void) => {
    onOpenChange(false);
    callback();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <CommandItem
                key={page.path}
                onSelect={() => handleSelect(() => navigate(page.path))}
                keywords={page.keywords}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{page.name}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <CommandItem key={action.name} onSelect={() => handleSelect(action.action)}>
                <Icon className="mr-2 h-4 w-4" />
                <span>{action.name}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => handleSelect(() => setTheme("light"))}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Light Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => setTheme("dark"))}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark Mode</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return { open, setOpen };
}
