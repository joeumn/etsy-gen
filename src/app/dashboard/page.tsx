"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvancedStatCard } from "@/components/ui/advanced-stat-card";
import { RevenueChart } from "@/components/ui/revenue-chart";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { 
  TrendingUp, 
  DollarSign, 
  Package,
  Target,
  Activity,
  ShoppingBag,
  Zap,
  Play,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Dashboard() {
  // Real-time stats
  const stats = [
    {
      title: "Total Revenue",
      value: "$24,890",
      description: "Last 30 days",
      trend: { value: 18.5, label: "vs previous", isPositive: true },
      icon: DollarSign,
      gradient: "flame" as const,
    },
    {
      title: "Products Listed",
      value: "47",
      description: "Across all platforms",
      trend: { value: 12.3, label: "this month", isPositive: true },
      icon: Package,
      gradient: "ocean" as const,
    },
    {
      title: "Active Scrapes",
      value: "23",
      description: "Running now",
      icon: Activity,
      gradient: "gold" as const,
    },
    {
      title: "Success Rate",
      value: "94%",
      description: "Conversion rate",
      trend: { value: 3.2, label: "vs previous", isPositive: true },
      icon: Target,
      gradient: "forge" as const,
    },
  ];

  const revenueData = [
    { name: "Week 1", revenue: 4200, profit: 2100 },
    { name: "Week 2", revenue: 3800, profit: 1900 },
    { name: "Week 3", revenue: 5400, profit: 2700 },
    { name: "Week 4", revenue: 6300, profit: 3150 },
    { name: "Week 5", revenue: 5200, profit: 2600 },
  ];

  const marketplaceData = [
    { subject: "Etsy", value: 85 },
    { subject: "Shopify", value: 72 },
    { subject: "Amazon", value: 68 },
    { subject: "Gumroad", value: 45 },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Product Listed",
      product: "Minimalist Planner Template",
      marketplace: "Etsy",
      time: "2 min ago",
      status: "success",
    },
    {
      id: 2,
      action: "Trend Scan Completed",
      product: "Digital Downloads",
      marketplace: "All",
      time: "15 min ago",
      status: "success",
    },
    {
      id: 3,
      action: "AI Generation",
      product: "Watercolor Wedding Suite",
      marketplace: "Shopify",
      time: "1 hour ago",
      status: "success",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">Command Center</h1>
          <p className="text-muted-foreground">
            Your autonomous product empire at a glance
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <AdvancedStatCard
              key={stat.title}
              {...stat}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart
            data={revenueData}
            type="area"
            title="Revenue Overview"
            description="Weekly revenue and profit"
            delay={0.2}
          />
          <RevenueChart
            data={marketplaceData}
            type="radar"
            title="Marketplace Performance"
            description="Sales distribution across platforms"
            delay={0.3}
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-flame-500" />
                Manual Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  className="h-20 flex flex-col gap-2 bg-ocean-gradient text-white hover:opacity-90"
                  asChild
                >
                  <Link href="/products">
                    <Package className="h-6 w-6" />
                    <span>Generate Product</span>
                  </Link>
                </Button>
                <Button 
                  className="h-20 flex flex-col gap-2 bg-flame-gradient text-white hover:opacity-90"
                >
                  <Play className="h-6 w-6" />
                  <span>Run Trend Scan</span>
                </Button>
                <Button 
                  className="h-20 flex flex-col gap-2 bg-gold-gradient text-white hover:opacity-90"
                  asChild
                >
                  <Link href="/analytics">
                    <BarChart3 className="h-6 w-6" />
                    <span>View Analytics</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <div>
                        <p className="font-semibold">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.product} • {activity.marketplace}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{activity.time}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Marketplace Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Connected Marketplaces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['Etsy', 'Shopify', 'Amazon', 'Gumroad'].map((marketplace, index) => (
                  <motion.div
                    key={marketplace}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                    className="p-4 border rounded-lg text-center hover:bg-muted/50 transition-colors"
                  >
                    <p className="font-semibold mb-1">{marketplace}</p>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-muted-foreground">Active</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
