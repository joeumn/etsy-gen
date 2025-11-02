import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { TrendingUp, Package, Store, Sparkles, Zap, FileText } from "lucide-react";
import { motion } from "motion/react";

interface QuickAction {
  icon: typeof TrendingUp;
  label: string;
  description: string;
  color: string;
  onClick: () => void;
}

interface QuickActionsProps {
  actions?: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  const defaultActions: QuickAction[] = [
    {
      icon: TrendingUp,
      label: "Scan Trends",
      description: "Find hot niches",
      color: "text-chart-1",
      onClick: () => console.log("Scan trends"),
    },
    {
      icon: Sparkles,
      label: "Generate Product",
      description: "Create with AI",
      color: "text-chart-2",
      onClick: () => console.log("Generate product"),
    },
    {
      icon: Store,
      label: "List on Marketplace",
      description: "Auto-publish",
      color: "text-chart-3",
      onClick: () => console.log("List on marketplace"),
    },
    {
      icon: FileText,
      label: "View Reports",
      description: "Get insights",
      color: "text-chart-4",
      onClick: () => console.log("View reports"),
    },
    {
      icon: Zap,
      label: "Optimize Listings",
      description: "AI suggestions",
      color: "text-chart-5",
      onClick: () => console.log("Optimize listings"),
    },
    {
      icon: Package,
      label: "Manage Inventory",
      description: "Track products",
      color: "text-chart-1",
      onClick: () => console.log("Manage inventory"),
    },
  ];

  const displayActions = actions || defaultActions;

  return (
    <Card className="hover-lift">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks at your fingertips</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {displayActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  variant="outline"
                  className="h-auto w-full flex flex-col items-start p-4 hover:border-primary transition-base"
                  onClick={action.onClick}
                >
                  <Icon className={`h-5 w-5 ${action.color} mb-2`} />
                  <span className="text-sm font-medium text-left">{action.label}</span>
                  <span className="text-xs text-muted-foreground text-left">{action.description}</span>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
