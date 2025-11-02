import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { 
  ShoppingBag, 
  TrendingUp,
  Zap,
  CheckCircle,
  Settings,
  Eye,
  Activity,
  BarChart3,
  Sparkles
} from "lucide-react";

const marketplaces = [
  {
    id: 1,
    name: "Etsy",
    icon: ShoppingBag,
    color: "text-[#F1641E]",
    status: "connected",
    description: "Digital downloads marketplace",
    scanningEnabled: true,
    autoListingEnabled: true,
    stats: {
      trendsScanned: 234,
      productsListed: 89,
      revenue: "$12,450",
      avgSales: 3.2
    }
  },
  {
    id: 2,
    name: "Gumroad",
    icon: ShoppingBag,
    color: "text-[#FF90E8]",
    status: "connected",
    description: "Creator-focused digital products",
    scanningEnabled: true,
    autoListingEnabled: true,
    stats: {
      trendsScanned: 156,
      productsListed: 67,
      revenue: "$8,920",
      avgSales: 4.8
    }
  },
  {
    id: 3,
    name: "Creative Market",
    icon: ShoppingBag,
    color: "text-[#8BA4FF]",
    status: "connected",
    description: "Design assets and templates",
    scanningEnabled: true,
    autoListingEnabled: true,
    stats: {
      trendsScanned: 189,
      productsListed: 72,
      revenue: "$7,650",
      avgSales: 3.9
    }
  },
  {
    id: 4,
    name: "Envato Market",
    icon: ShoppingBag,
    color: "text-[#82B541]",
    status: "connected",
    description: "Premium digital assets",
    scanningEnabled: false,
    autoListingEnabled: false,
    stats: {
      trendsScanned: 0,
      productsListed: 0,
      revenue: "$0",
      avgSales: 0
    }
  },
  {
    id: 5,
    name: "Shopify",
    icon: ShoppingBag,
    color: "text-[#96BF48]",
    status: "not-connected",
    description: "Own storefront for digital goods",
    scanningEnabled: false,
    autoListingEnabled: false,
    stats: {
      trendsScanned: 0,
      productsListed: 0,
      revenue: "$0",
      avgSales: 0
    }
  },
  {
    id: 6,
    name: "Amazon KDP",
    icon: ShoppingBag,
    color: "text-[#FF9900]",
    status: "not-connected",
    description: "Kindle Direct Publishing",
    scanningEnabled: false,
    autoListingEnabled: false,
    stats: {
      trendsScanned: 0,
      productsListed: 0,
      revenue: "$0",
      avgSales: 0
    }
  },
];

export function MarketplacesPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-primary">
            Marketplace Intelligence
          </h2>
          <p className="text-muted-foreground">
            AI-powered trend scanning and auto-listing across platforms
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Trends Scanned</p>
                </div>
                <h3 className="text-3xl">579</h3>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-secondary">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-secondary" />
                  <p className="text-sm text-muted-foreground">Auto-Listed</p>
                </div>
                <h3 className="text-3xl">228</h3>
                <p className="text-xs text-success">+47 today</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-accent" />
                  <p className="text-sm text-muted-foreground">Active Scans</p>
                </div>
                <h3 className="text-3xl">3</h3>
                <p className="text-xs text-muted-foreground">Marketplaces</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-success" />
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
                <h3 className="text-3xl">$29K</h3>
                <p className="text-xs text-success">+15% vs last month</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Marketplace Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {marketplaces.map((marketplace) => (
            <Card 
              key={marketplace.id}
              className={
                marketplace.status === "connected"
                  ? "border-primary/50"
                  : ""
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-3">
                      <marketplace.icon className={`h-6 w-6 ${marketplace.color}`} />
                    </div>
                    <div>
                      <CardTitle>{marketplace.name}</CardTitle>
                    </div>
                  </div>
                  <Badge
                    variant={
                      marketplace.status === "connected"
                        ? "default"
                        : "secondary"
                    }
                    className={
                      marketplace.status === "connected"
                        ? "bg-success text-success-foreground"
                        : ""
                    }
                  >
                    {marketplace.status === "connected" ? (
                      <>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Connected
                      </>
                    ) : (
                      "Not Connected"
                    )}
                  </Badge>
                </div>
                <CardDescription>{marketplace.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {marketplace.status === "connected" && (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`scan-${marketplace.id}`} className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          Trend Scanning
                        </Label>
                        <Switch
                          id={`scan-${marketplace.id}`}
                          checked={marketplace.scanningEnabled}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`auto-${marketplace.id}`} className="flex items-center gap-2 text-sm">
                          <Zap className="h-4 w-4 text-accent" />
                          Auto-Listing
                        </Label>
                        <Switch
                          id={`auto-${marketplace.id}`}
                          checked={marketplace.autoListingEnabled}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Trends Scanned</span>
                        <span>{marketplace.stats.trendsScanned}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Products Listed</span>
                        <span>{marketplace.stats.productsListed}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-semibold">{marketplace.stats.revenue}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Avg. Daily Sales</span>
                          <span>{marketplace.stats.avgSales}</span>
                        </div>
                        <Progress value={marketplace.stats.avgSales * 20} className="h-2" />
                      </div>
                    </div>
                  </>
                )}

                {marketplace.status === "not-connected" && (
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <Sparkles className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Connect to enable AI trend scanning and auto-listing
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="gap-2">
                {marketplace.status === "connected" ? (
                  <>
                    <Button variant="outline" className="flex-1">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Data
                    </Button>
                  </>
                ) : (
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Connect Marketplace
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Scanner Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <Activity className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <div>
                <CardTitle>Active Trend Scanner</CardTitle>
                <CardDescription>
                  Real-time monitoring of marketplace opportunities
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm text-muted-foreground">Scanning Etsy</span>
                </div>
                <p className="text-2xl">234</p>
                <p className="text-xs text-muted-foreground">trends analyzed</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm text-muted-foreground">Scanning Gumroad</span>
                </div>
                <p className="text-2xl">156</p>
                <p className="text-xs text-muted-foreground">trends analyzed</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm text-muted-foreground">Scanning Creative Market</span>
                </div>
                <p className="text-2xl">189</p>
                <p className="text-xs text-muted-foreground">trends analyzed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
