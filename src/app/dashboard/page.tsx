"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvancedStatCard } from "@/components/ui/advanced-stat-card";
import { RevenueChart } from "@/components/ui/revenue-chart";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  DollarSign,
  Package,
  Target,
  Activity,
  ShoppingBag,
  Zap,
  Play,
  BarChart3,
  LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  // Define stat card type
  type StatCard = {
    title: string;
    value: string;
    description: string;
    trend?: { value: number; label: string; isPositive: boolean };
    icon: LucideIcon;
    gradient: "flame" | "ocean" | "gold" | "forge";
  };

  type RevenueDataPoint = {
    name: string;
    revenue: number;
    profit: number;
  };

  type MarketplaceDataPoint = {
    subject: string;
    value: number;
  };

  type Activity = {
    id: string | number;
    action: string;
    product: string;
    marketplace: string;
    time: string;
    status: string;
  };

  // Fetch real stats from API
  const [stats, setStats] = useState<StatCard[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [marketplaceData, setMarketplaceData] = useState<MarketplaceDataPoint[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all dashboard data in parallel
        const [statsRes, revenueRes, marketplaceRes, activityRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/revenue'),
          fetch('/api/dashboard/marketplace-stats'),
          fetch('/api/dashboard/activity'),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats);
        } else {
          console.error('Failed to fetch stats:', await statsRes.text());
          setStats([]);
        }

        if (revenueRes.ok) {
          const data = await revenueRes.json();
          setRevenueData(data.revenueData || []);
        } else {
          console.error('Failed to fetch revenue data:', await revenueRes.text());
          setRevenueData([]);
        }

        if (marketplaceRes.ok) {
          const data = await marketplaceRes.json();
          setMarketplaceData(data.marketplaceData || []);
        } else {
          console.error('Failed to fetch marketplace data:', await marketplaceRes.text());
          setMarketplaceData([]);
        }

        if (activityRes.ok) {
          const data = await activityRes.json();
          setRecentActivity(data.recentActivity || []);
        } else {
          console.error('Failed to fetch activity data:', await activityRes.text());
          setRecentActivity([]);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setStats([]);
        setRevenueData([]);
        setMarketplaceData([]);
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleTrendScan = async () => {
    setScanning(true);
    toast.info("Starting trend scan...");
    
    try {
      const response = await fetch('/api/scan?marketplace=etsy&limit=50');
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Trend scan complete! Found ${data.data.trends?.length || 0} trending products.`);
      } else {
        toast.error("Trend scan failed. Please check your marketplace configuration.");
      }
    } catch (error) {
      console.error('Trend scan error:', error);
      toast.error("Failed to run trend scan. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Command Center</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Your autonomous product empire at a glance
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <AdvancedStatCard
              key={stat.title}
              {...stat}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Zap className="h-5 w-5 text-flame-500" />
                Manual Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <Button 
                  className="h-16 md:h-20 flex flex-col gap-2 bg-ocean-gradient text-white hover:opacity-90"
                  asChild
                >
                  <Link href="/products">
                    <Package className="h-5 w-5 md:h-6 md:w-6" />
                    <span className="text-sm md:text-base">Generate Product</span>
                  </Link>
                </Button>
                <Button 
                  className="h-16 md:h-20 flex flex-col gap-2 bg-flame-gradient text-white hover:opacity-90"
                  onClick={handleTrendScan}
                  disabled={scanning}
                >
                  <Play className="h-5 w-5 md:h-6 md:w-6" />
                  <span className="text-sm md:text-base">{scanning ? "Scanning..." : "Run Trend Scan"}</span>
                </Button>
                <Button 
                  className="h-16 md:h-20 flex flex-col gap-2 bg-gold-gradient text-white hover:opacity-90 sm:col-span-2 md:col-span-1"
                  asChild
                >
                  <Link href="/analytics">
                    <BarChart3 className="h-5 w-5 md:h-6 md:w-6" />
                    <span className="text-sm md:text-base">View Analytics</span>
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
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
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
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm md:text-base">{activity.action}</p>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">
                          {activity.product} • {activity.marketplace}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs md:text-sm text-muted-foreground pl-5 sm:pl-0">{activity.time}</span>
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
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <ShoppingBag className="h-5 w-5" />
                Connected Marketplaces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {['Etsy', 'Shopify', 'Amazon', 'Gumroad'].map((marketplace, index) => (
                  <motion.div
                    key={marketplace}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                    className="p-3 md:p-4 border rounded-lg text-center hover:bg-muted/50 transition-colors"
                  >
                    <p className="font-semibold text-sm md:text-base mb-1">{marketplace}</p>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-xs md:text-sm text-muted-foreground">Active</span>
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
