"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdvancedStatCard } from "@/components/ui/advanced-stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  Store,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  DollarSign,
  Package,
  Activity,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { getCurrentUserId } from "@/lib/session";

export default function MarketplacesPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [marketplaces, setMarketplaces] = useState<any[]>([]);
  const [stats, setStats] = useState({
    connectedPlatforms: 0,
    totalSales: 0,
    totalRevenue: 0,
    syncStatus: 0,
  });

  // Load marketplace data from API
  useEffect(() => {
    const loadMarketplaces = async () => {
      try {
        const userId = getCurrentUserId();
        if (!userId) {
          console.error('No user ID found');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/marketplaces?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setMarketplaces(data.marketplaces || []);
          setStats(data.stats || {});
        } else {
          console.error('Failed to load marketplaces:', await response.text());
        }
      } catch (error) {
        console.error('Error loading marketplaces:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMarketplaces();
  }, []);

  const statsCards = [
    {
      title: "Connected Platforms",
      value: String(stats.connectedPlatforms),
      description: "Active integrations",
      icon: Store,
      gradient: "ocean" as const,
    },
    {
      title: "Total Sales",
      value: stats.totalSales.toLocaleString(),
      description: "Across all platforms",
      icon: Package,
      gradient: "flame" as const,
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      description: "Combined earnings",
      icon: DollarSign,
      gradient: "gold" as const,
    },
    {
      title: "Sync Status",
      value: `${stats.syncStatus}%`,
      description: "All platforms synced",
      icon: Activity,
      gradient: "forge" as const,
    },
  ];

  const handleSync = async (marketplace: string) => {
    setIsSyncing(true);
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSyncing(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Marketplaces</h1>
          <p className="text-muted-foreground">
            Manage connections and sync data across all platforms
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-flame-500 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => (
                <AdvancedStatCard key={stat.title} {...stat} delay={index * 0.1} />
              ))}
            </div>

            {/* Marketplace Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {marketplaces.map((mp) => (
            <Card key={mp.name} className="card-hover">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{mp.icon}</span>
                    <div>
                      <CardTitle className="text-xl">{mp.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Last sync: {mp.lastSync}
                      </p>
                    </div>
                  </div>
                  {mp.status === "connected" ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      Available
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{mp.products}</p>
                    <p className="text-xs text-muted-foreground">Products</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mp.sales}</p>
                    <p className="text-xs text-muted-foreground">Sales</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      ${mp.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                </div>

                {/* Sync Progress */}
                {mp.status === "connected" && (
                  <div>
                    <ProgressBar
                      value={mp.syncProgress}
                      variant="flame"
                      size="sm"
                      label={`Sync ${mp.syncProgress}%`}
                    />
                  </div>
                )}

                {/* API Health */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">API Health:</span>
                  <div className="flex items-center gap-2">
                    {mp.apiHealth === "healthy" ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-green-600">Healthy</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        <span className="text-gray-600">Not Connected</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {mp.status === "connected" ? (
                    <>
                      <Button
                        onClick={() => handleSync(mp.name)}
                        disabled={isSyncing}
                        className="flex-1"
                        variant="outline"
                      >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        Sync Now
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button className="flex-1 bg-ocean-gradient text-white">
                      Connect {mp.name}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

