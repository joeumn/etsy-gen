import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import {
  TrendingUp,
  Package,
  Store,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";

interface Activity {
  id: string;
  type: "trend" | "product" | "marketplace" | "success" | "pending" | "error";
  title: string;
  description: string;
  timestamp: string;
  status?: "success" | "pending" | "failed";
}

interface RecentActivityProps {
  activities?: Activity[];
  maxItems?: number;
}

export function RecentActivity({ activities, maxItems = 10 }: RecentActivityProps) {
  const defaultActivities: Activity[] = [
    {
      id: "1",
      type: "success",
      title: "Product Listed Successfully",
      description: "Digital Planner Templates uploaded to Etsy",
      timestamp: "2 minutes ago",
      status: "success",
    },
    {
      id: "2",
      type: "trend",
      title: "New Trend Detected",
      description: "High demand for minimalist wall art",
      timestamp: "15 minutes ago",
    },
    {
      id: "3",
      type: "product",
      title: "AI Product Generation Complete",
      description: "Created 5 new social media templates",
      timestamp: "1 hour ago",
      status: "success",
    },
    {
      id: "4",
      type: "marketplace",
      title: "Marketplace Connected",
      description: "Shopify store linked successfully",
      timestamp: "2 hours ago",
      status: "success",
    },
    {
      id: "5",
      type: "pending",
      title: "Processing Trend Scan",
      description: "Analyzing 50 marketplace categories",
      timestamp: "3 hours ago",
      status: "pending",
    },
    {
      id: "6",
      type: "success",
      title: "Sales Milestone Reached",
      description: "100 products sold this month",
      timestamp: "5 hours ago",
      status: "success",
    },
    {
      id: "7",
      type: "trend",
      title: "Market Opportunity",
      description: "Home office decor trending up 45%",
      timestamp: "8 hours ago",
    },
    {
      id: "8",
      type: "product",
      title: "Bulk Products Generated",
      description: "Created 20 printable worksheets",
      timestamp: "1 day ago",
      status: "success",
    },
  ];

  const displayActivities = (activities || defaultActivities).slice(0, maxItems);

  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "trend":
        return TrendingUp;
      case "product":
        return Package;
      case "marketplace":
        return Store;
      case "success":
        return CheckCircle;
      case "pending":
        return Clock;
      case "error":
        return AlertCircle;
      default:
        return Sparkles;
    }
  };

  const getIconColor = (type: Activity["type"], status?: Activity["status"]) => {
    if (status === "success") return "text-success";
    if (status === "pending") return "text-warning";
    if (status === "failed") return "text-destructive";

    switch (type) {
      case "trend":
        return "text-chart-1";
      case "product":
        return "text-chart-2";
      case "marketplace":
        return "text-chart-3";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status?: Activity["status"]) => {
    if (!status) return null;

    const variants = {
      success: "bg-success/10 text-success border-success/20",
      pending: "bg-warning/10 text-warning border-warning/20",
      failed: "bg-destructive/10 text-destructive border-destructive/20",
    };

    return (
      <Badge variant="outline" className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="hover-lift">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates from your AI agents</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {displayActivities.map((activity, index) => {
              const Icon = getIcon(activity.type);
              const iconColor = getIconColor(activity.type, activity.status);

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
                >
                  <div className={`rounded-lg bg-muted p-2 h-fit ${activity.status === "pending" ? "animate-pulse-subtle" : ""}`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-none">{activity.title}</p>
                      {getStatusBadge(activity.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
