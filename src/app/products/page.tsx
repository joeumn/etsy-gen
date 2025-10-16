"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AdvancedStatCard } from "@/components/ui/advanced-stat-card";
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  ExternalLink,
  TrendingUp,
  DollarSign,
  Eye,
  RefreshCw
} from "lucide-react";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const stats = [
    {
      title: "Total Products",
      value: "127",
      description: "All-time created",
      icon: Package,
      gradient: "ocean" as const,
    },
    {
      title: "Active Listings",
      value: "94",
      description: "Live on marketplaces",
      trend: { value: 8.2, label: "this week", isPositive: true },
      icon: TrendingUp,
      gradient: "flame" as const,
    },
    {
      title: "Total Revenue",
      value: "$18,450",
      description: "From products",
      trend: { value: 15.3, label: "vs last month", isPositive: true },
      icon: DollarSign,
      gradient: "gold" as const,
    },
    {
      title: "Avg Performance",
      value: "3.8/5",
      description: "Product rating",
      icon: Eye,
      gradient: "forge" as const,
    },
  ];

  const products = [
    {
      id: 1,
      title: "Minimalist Daily Planner 2025",
      category: "Printables",
      marketplace: ["Etsy", "Shopify"],
      price: 12.99,
      revenue: 3450,
      sales: 266,
      status: "active",
      performance: "high",
      createdAt: "2025-01-15",
      aiProvider: "Gemini",
    },
    {
      id: 2,
      title: "Watercolor Wedding Invitation Suite",
      category: "Templates",
      marketplace: ["Etsy"],
      price: 24.99,
      revenue: 4890,
      sales: 196,
      status: "active",
      performance: "high",
      createdAt: "2025-01-10",
      aiProvider: "OpenAI",
    },
    {
      id: 3,
      title: "Social Media Content Calendar",
      category: "Templates",
      marketplace: ["Shopify", "Gumroad"],
      price: 19.99,
      revenue: 2100,
      sales: 105,
      status: "active",
      performance: "medium",
      createdAt: "2025-01-08",
      aiProvider: "Gemini",
    },
    {
      id: 4,
      title: "Business Logo Mockup Pack",
      category: "Graphics",
      marketplace: ["Etsy", "Amazon"],
      price: 29.99,
      revenue: 5680,
      sales: 189,
      status: "active",
      performance: "high",
      createdAt: "2025-01-05",
      aiProvider: "DALL-E",
    },
  ];

  const handleGenerateProduct = async () => {
    setIsGenerating(true);
    try {
      // Call real API to generate product
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trendData: {
            keywords: ['planner', 'template', '2025'],
            salesVelocity: 85,
            priceRange: { min: 9.99, max: 29.99 },
            competitionLevel: 'medium',
            seasonality: ['year-round'],
            targetAudience: ['professionals', 'students'],
          },
          productType: 'digital_download',
          targetMarketplace: 'etsy',
          aiProvider: 'gemini',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Handle successful generation
        console.log('Product generated:', data);
        // Refresh products list or add new product to state
      } else {
        console.error('Failed to generate product');
      }
    } catch (error) {
      console.error('Error generating product:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Product Management</h1>
            <p className="text-muted-foreground">
              AI-generated products across all marketplaces
            </p>
          </div>
          <Button
            onClick={handleGenerateProduct}
            disabled={isGenerating}
            className="bg-flame-gradient text-white hover:opacity-90"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Generate via AI
              </>
            )}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <AdvancedStatCard key={stat.title} {...stat} delay={index * 0.1} />
          ))}
        </div>

        {/* Filters & Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Products ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Product</th>
                    <th className="text-left py-3 px-4 font-semibold">Marketplace</th>
                    <th className="text-right py-3 px-4 font-semibold">Price</th>
                    <th className="text-right py-3 px-4 font-semibold">Revenue</th>
                    <th className="text-right py-3 px-4 font-semibold">Sales</th>
                    <th className="text-center py-3 px-4 font-semibold">Performance</th>
                    <th className="text-center py-3 px-4 font-semibold">Status</th>
                    <th className="text-center py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold">{product.title}</p>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {product.marketplace.map((mp) => (
                            <Badge key={mp} variant="outline" className="text-xs">
                              {mp}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold">
                        ${product.price}
                      </td>
                      <td className="py-4 px-4 text-right text-green-600 font-semibold">
                        ${product.revenue.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right">{product.sales}</td>
                      <td className="py-4 px-4 text-center">
                        <Badge
                          className={
                            product.performance === "high"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-yellow-100 text-yellow-700 border-yellow-200"
                          }
                        >
                          {product.performance}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge
                          className={
                            product.status === "active"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }
                        >
                          {product.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="View">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Delete">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

