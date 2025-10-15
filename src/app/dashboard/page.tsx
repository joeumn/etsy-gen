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
  Target,
  Users,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Bell,
  Search,
  Filter,
  Download,
  Share2,
  MoreHorizontal
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Toaster } from "sonner";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [showPricing, setShowPricing] = useState(false);
  const [showBrandKit, setShowBrandKit] = useState(false);
  const [currentPlan] = useState("free");
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Real-time data state
  const [stats, setStats] = useState([
    {
      title: "Total Revenue",
      value: "$12,450",
      description: "This month",
      trend: { value: 12.5, label: "vs last month" },
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Products Generated",
      value: "47",
      description: "This month",
      trend: { value: 8.2, label: "vs last month" },
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Trend Scans",
      value: "23",
      description: "This month",
      trend: { value: -2.1, label: "vs last month" },
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Success Rate",
      value: "94%",
      description: "Conversion rate",
      trend: { value: 3.2, label: "vs last month" },
      icon: Target,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ]);

  // Fetch real-time data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLastUpdated(new Date());
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-flame-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="w-full max-w-md text-center p-8">
          <div className="w-16 h-16 bg-flame-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Access Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to access your dashboard
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/auth/signup">Create Account</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
      <Toaster position="top-right" />
      
      {/* Enhanced Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
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
          
          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products, trends, analytics..."
                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-flame-500/20 focus:border-flame-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                3
              </span>
            </Button>

            {/* Refresh Data */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.reload()}
              className="hover:bg-muted/50"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            <ThemeToggle />
            
            {/* User Menu */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium">{session?.user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
              <Button 
                size="sm" 
                onClick={() => setShowPricing(true)}
                className="bg-flame-gradient hover:opacity-90 text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="text-muted-foreground">
                Here&apos;s what&apos;s happening with your products today.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Last updated</p>
                <p className="text-sm font-medium">
                  {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group"
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {stat.description}
                  </p>
                  <div className="flex items-center gap-1">
                    {stat.trend.value > 0 ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        stat.trend.value > 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {stat.trend.value > 0 ? "+" : ""}{stat.trend.value}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {stat.trend.label}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
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