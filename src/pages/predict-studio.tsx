import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Sparkles,
  TrendingUp,
  Package,
  Eye,
  Download,
  Share,
  Star,
  Clock,
  DollarSign,
  Users,
} from "lucide-react";
import { useState } from "react";

export function PredictStudioPage() {
  const [selectedCategory, setSelectedCategory] = useState("");

  const generatedProducts = [
    {
      id: 1,
      title: "Handmade Ceramic Coffee Mug Set",
      category: "Home & Living",
      predictedPrice: 45.99,
      confidence: 92,
      trendScore: 8.5,
      estimatedSales: 127,
      image: "/api/placeholder/300/200",
      status: "ready",
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      title: "Vintage Style Wall Art Print",
      category: "Art & Collectibles",
      predictedPrice: 28.50,
      confidence: 88,
      trendScore: 9.2,
      estimatedSales: 89,
      image: "/api/placeholder/300/200",
      status: "ready",
      createdAt: "2024-01-14",
    },
    {
      id: 3,
      title: "Organic Cotton Baby Onesie",
      category: "Clothing",
      predictedPrice: 24.99,
      confidence: 95,
      trendScore: 7.8,
      estimatedSales: 203,
      image: "/api/placeholder/300/200",
      status: "processing",
      createdAt: "2024-01-13",
    },
  ];

  const categories = [
    "Home & Living",
    "Art & Collectibles",
    "Clothing",
    "Jewelry",
    "Accessories",
    "Toys & Games",
    "Books & Zines",
    "Electronics",
    "Beauty & Personal Care",
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-primary flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              Predict Studio
            </h2>
            <p className="text-muted-foreground">
              Generate and analyze product predictions powered by AI
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Sparkles className="mr-2 h-4 w-4" />
            Generate New Product
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">
                +12 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">91%</div>
              <p className="text-xs text-muted-foreground">
                +2% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,847</div>
              <p className="text-xs text-muted-foreground">
                +18% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                +5 from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Product Generation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Generate New Product Idea</CardTitle>
            <CardDescription>
              Let AI analyze market trends and generate profitable product ideas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Product Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (Optional)</Label>
                <Input
                  id="keywords"
                  placeholder="e.g., sustainable, minimalist, vintage"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Additional Context</Label>
              <Textarea
                id="description"
                placeholder="Describe your target audience, preferred materials, or specific requirements..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button className="bg-primary hover:bg-primary/90">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Product
              </Button>
              <Button variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                Analyze Trends
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Products */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Products</CardTitle>
            <CardDescription>
              AI-generated product ideas with market analysis and pricing predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedProducts.map((product) => (
                <div key={product.id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{product.title}</h4>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      <Badge variant={product.status === "ready" ? "default" : "secondary"}>
                        {product.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">${product.predictedPrice}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{product.confidence}% confidence</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span>{product.trendScore}/10 trend score</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{product.estimatedSales} est. sales/mo</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Created {product.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Insights */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Trending Categories</CardTitle>
              <CardDescription>
                Most profitable categories this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { category: "Home & Living", growth: "+23%", products: 45 },
                  { category: "Art & Collectibles", growth: "+18%", products: 32 },
                  { category: "Clothing", growth: "+15%", products: 28 },
                  { category: "Jewelry", growth: "+12%", products: 21 },
                ].map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.category}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.products} products
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {item.growth}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Price Optimization</CardTitle>
              <CardDescription>
                Recommended pricing strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { range: "$15-25", success: "High", volume: "Medium" },
                  { range: "$25-40", success: "Very High", volume: "High" },
                  { range: "$40-60", success: "High", volume: "Medium" },
                  { range: "$60+", success: "Medium", volume: "Low" },
                ].map((item) => (
                  <div key={item.range} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.range}</div>
                      <div className="text-sm text-muted-foreground">
                        Volume: {item.volume}
                      </div>
                    </div>
                    <Badge
                      variant={item.success === "Very High" ? "default" : "secondary"}
                      className={
                        item.success === "Very High"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }
                    >
                      {item.success}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}