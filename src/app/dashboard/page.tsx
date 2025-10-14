"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { RevenueChart } from "@/components/ui/revenue-chart";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PricingDialog } from "@/components/ui/pricing-dialog";
import { BrandKitModal } from "@/components/ui/brand-kit-modal";
import { 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Package,
  Settings,
  Palette,
  BarChart3,
  Plus,
  Zap,
  Crown,
  Target
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [showPricing, setShowPricing] = useState(false);
  const [showBrandKit, setShowBrandKit] = useState(false);
  const [currentPlan] = useState("free");

  // Mock data - in real app, this would come from API
  const stats = [
    {
      title: "Total Revenue",
      value: "$12,450",
      description: "This month",
      trend: { value: 12.5, label: "vs last month" },
      icon: DollarSign,
    },
    {
      title: "Products Generated",
      value: "47",
      description: "This month",
      trend: { value: 8.2, label: "vs last month" },
      icon: Package,
    },
    {
      title: "Trend Scans",
      value: "23",
      description: "This month",
      trend: { value: -2.1, label: "vs last month" },
      icon: TrendingUp,
    },
    {
      title: "Success Rate",
      value: "94%",
      description: "Conversion rate",
      trend: { value: 3.2, label: "vs last month" },
      icon: Target,
    },
  ];

  const revenueData = [
    { name: "Jan", value: 4000 },
    { name: "Feb", value: 3000 },
    { name: "Mar", value: 5000 },
    { name: "Apr", value: 4500 },
    { name: "May", value: 6000 },
    { name: "Jun", value: 5500 },
  ];

  const socialTrendData = [
    { subject: "TikTok", A: 85, fullMark: 100 },
    { subject: "Pinterest", A: 72, fullMark: 100 },
    { subject: "Instagram", A: 68, fullMark: 100 },
    { subject: "Twitter", A: 45, fullMark: 100 },
    { subject: "YouTube", A: 78, fullMark: 100 },
  ];

  const recentProducts = [
    {
      id: 1,
      title: "Minimalist Planner Template",
      category: "Digital Downloads",
      revenue: 1250,
      status: "Active",
      trend: "High",
    },
    {
      id: 2,
      title: "Watercolor Wedding Invitations",
      category: "Templates",
      revenue: 890,
      status: "Active",
      trend: "Medium",
    },
    {
      id: 3,
      title: "Business Card Mockup Pack",
      category: "Design Assets",
      revenue: 2100,
      status: "Active",
      trend: "High",
    },
  ];

  const mockBrandKit = {
    id: "1",
    name: "My Brand Kit",
    logoUrl: "https://via.placeholder.com/200x100/2D9CDB/FFFFFF?text=LOGO",
    colorPalette: {
      primary: "#2D9CDB",
      secondary: "#FF6B22",
      accent: "#FFC400",
      neutral: "#6B7280",
    },
    typography: {
      heading: "Inter, sans-serif",
      body: "Inter, sans-serif",
      accent: "Playfair Display, serif",
    },
    tagline: "Creating digital products that inspire",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-flame-gradient rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">FoundersForge</span>
          </motion.div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button 
              size="sm" 
              onClick={() => setShowPricing(true)}
              className="bg-flame-500 hover:bg-flame-600"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your products.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.title}
              {...stat}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueChart
            data={revenueData}
            type="area"
            title="Revenue Overview"
            description="Monthly revenue from your products"
            delay={0.4}
          />
          <RevenueChart
            data={socialTrendData}
            type="radar"
            title="Social Trend Scores"
            description="Performance across social platforms"
            delay={0.5}
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-20 flex flex-col gap-2" asChild>
                  <Link href="/scan">
                    <TrendingUp className="h-6 w-6" />
                    Scan Trends
                  </Link>
                </Button>
                <Button className="h-20 flex flex-col gap-2" asChild>
                  <Link href="/generate">
                    <Plus className="h-6 w-6" />
                    Generate Product
                  </Link>
                </Button>
                {process.env.NEXT_PUBLIC_ENABLE_ZIG3_STUDIO === 'true' && (
                  <Button className="h-20 flex flex-col gap-2" asChild>
                    <Link href="/studio">
                      <Palette className="h-6 w-6" />
                      Design Studio
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Recent Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold">{product.title}</h3>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">${product.revenue}</p>
                      <p className="text-sm text-muted-foreground">{product.status}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Brand Kit CTA */}
        {process.env.NEXT_PUBLIC_ENABLE_ZIG6_BRANDING === 'true' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <Card className="bg-gradient-to-r from-ocean-500/10 to-flame-500/10 border-ocean-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Create Your Brand Kit</h3>
                    <p className="text-muted-foreground">
                      Generate a complete brand identity with AI-powered logo, colors, and typography.
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowBrandKit(true)}
                    className="bg-ocean-500 hover:bg-ocean-600"
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Create Brand
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <PricingDialog
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        onSelectPlan={(plan: string) => {
          console.log("Selected plan:", plan);
          setShowPricing(false);
        }}
        currentPlan={currentPlan}
      />

      <BrandKitModal
        isOpen={showBrandKit}
        onClose={() => setShowBrandKit(false)}
        brandKit={mockBrandKit}
        onDownload={() => {
          console.log("Downloading brand kit...");
          setShowBrandKit(false);
        }}
      />
    </div>
  );
}