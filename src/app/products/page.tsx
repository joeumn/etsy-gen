"use client";

import { useState, useEffect } from "react";
import { AppLayout as DashboardLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AdvancedStatCard } from "@/components/ui/advanced-stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  RefreshCw,
  ArrowUpDown
} from "lucide-react";
import { getCurrentUserId } from "@/lib/session";
import { toast } from "sonner";

type Product = {
  id: string;
  title: string;
  category: string;
  marketplace: string[];
  price: number;
  revenue: number;
  sales: number;
  status: string;
  performance: string;
  createdAt: string;
  aiProvider: string;
};

type SortField = 'title' | 'price' | 'revenue' | 'sales' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [marketplaceFilter, setMarketplaceFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeListings: 0,
    totalRevenue: 0,
    avgPerformance: '0.0',
  });

  // Load products data from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const userId = getCurrentUserId();
        if (!userId) {
          console.error('No user ID found');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/products?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
          setStats(data.stats || {});
        } else {
          console.error('Failed to load products:', await response.text());
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const statsCards = [
    {
      title: "Total Products",
      value: String(stats.totalProducts),
      description: "All-time created",
      icon: Package,
      gradient: "ocean" as const,
    },
    {
      title: "Active Listings",
      value: String(stats.activeListings),
      description: "Live on marketplaces",
      icon: TrendingUp,
      gradient: "flame" as const,
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      description: "From products",
      icon: DollarSign,
      gradient: "gold" as const,
    },
    {
      title: "Avg Performance",
      value: `${stats.avgPerformance}/5`,
      description: "Product rating",
      icon: Eye,
      gradient: "forge" as const,
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    try {
      // Prepare CSV headers
      const headers = ['Title', 'Status', 'Marketplace', 'AI Bot', 'Created Date', 'Price', 'Revenue', 'Sales', 'Performance'];
      
      // Prepare CSV rows
      const rows = filteredAndSortedProducts.map(product => [
        product.title,
        product.status,
        product.marketplace.join('; '),
        product.aiProvider || 'N/A',
        new Date(product.createdAt).toLocaleDateString(),
        product.price.toFixed(2),
        product.revenue.toFixed(2),
        product.sales,
        product.performance
      ]);
      
      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `products-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exported ${filteredAndSortedProducts.length} products to CSV`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  // Filter products
  let filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesMarketplace = marketplaceFilter === 'all' || p.marketplace.includes(marketplaceFilter);
    
    return matchesSearch && matchesStatus && matchesMarketplace;
  });

  // Sort products
  const filteredAndSortedProducts = [...filteredProducts].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

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

            {/* Filters & Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter & Search Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={marketplaceFilter} onValueChange={setMarketplaceFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by marketplace" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Marketplaces</SelectItem>
                      <SelectItem value="etsy">Etsy</SelectItem>
                      <SelectItem value="shopify">Shopify</SelectItem>
                      <SelectItem value="amazon">Amazon</SelectItem>
                      <SelectItem value="gumroad">Gumroad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredAndSortedProducts.length} of {products.length} products
                  </p>
                  <Button variant="outline" onClick={handleExportCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Export to CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Products ({filteredAndSortedProducts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('title')}
                          className="h-8 px-2 lg:px-3"
                        >
                          Product
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Marketplace</TableHead>
                      <TableHead>AI Bot</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('createdAt')}
                          className="h-8 px-2 lg:px-3"
                        >
                          Created
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('price')}
                          className="h-8 px-2 lg:px-3"
                        >
                          Price
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('revenue')}
                          className="h-8 px-2 lg:px-3"
                        >
                          Revenue
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('sales')}
                          className="h-8 px-2 lg:px-3"
                        >
                          Sales
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-center">Performance</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          No products found. Try adjusting your filters or create a new product.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAndSortedProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <p className="font-semibold">{product.title}</p>
                              <p className="text-sm text-muted-foreground">{product.category}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={product.status === "active" ? "default" : "secondary"}
                            >
                              {product.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {product.marketplace.map((mp: string) => (
                                <Badge key={mp} variant="outline" className="text-xs">
                                  {mp}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{product.aiProvider || 'N/A'}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {new Date(product.createdAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ${product.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right text-green-600 font-semibold">
                            ${product.revenue.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">{product.sales}</TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                product.performance === "high" ? "default" : "secondary"
                              }
                            >
                              {product.performance}
                            </Badge>
                          </TableCell>
                          <TableCell>
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
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

