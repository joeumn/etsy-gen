import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  Bot, 
  Filter, 
  Search, 
  FileText, 
  Image as ImageIcon,
  Download,
  Eye,
  Edit,
  Sparkles,
  CheckCircle,
  Clock,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const products = [
  {
    id: 1,
    name: "Ultimate Wedding Planner Bundle",
    category: "Planners & Templates",
    type: "PDF",
    status: "Listed",
    aiGenerated: true,
    marketplaces: ["Etsy", "Gumroad", "Creative Market"],
    sales: 47,
    revenue: "$1,410",
    generated: "2 days ago",
    thumbnail: "📋"
  },
  {
    id: 2,
    name: "Fitness Goal Tracker Pro",
    category: "Planners & Templates",
    type: "Excel/PDF",
    status: "Listed",
    aiGenerated: true,
    marketplaces: ["Etsy", "Gumroad"],
    sales: 32,
    revenue: "$896",
    generated: "3 days ago",
    thumbnail: "💪"
  },
  {
    id: 3,
    name: "Monthly Budget Spreadsheet Pack",
    category: "Planners & Templates",
    type: "Excel",
    status: "Generating",
    aiGenerated: true,
    marketplaces: [],
    sales: 0,
    revenue: "$0",
    generated: "5 min ago",
    thumbnail: "💰"
  },
  {
    id: 4,
    name: "Professional Resume Template Set",
    category: "Templates",
    type: "Word/PDF",
    status: "Listed",
    aiGenerated: true,
    marketplaces: ["Creative Market", "Etsy"],
    sales: 68,
    revenue: "$1,904",
    generated: "5 days ago",
    thumbnail: "📄"
  },
  {
    id: 5,
    name: "Social Media Content Calendar",
    category: "Planners & Templates",
    type: "PDF/Excel",
    status: "Listing",
    aiGenerated: true,
    marketplaces: [],
    sales: 0,
    revenue: "$0",
    generated: "1 hour ago",
    thumbnail: "📱"
  },
  {
    id: 6,
    name: "Business Startup Checklist",
    category: "Templates",
    type: "PDF",
    status: "Listed",
    aiGenerated: true,
    marketplaces: ["Gumroad", "Etsy"],
    sales: 23,
    revenue: "$529",
    generated: "1 week ago",
    thumbnail: "🚀"
  },
  {
    id: 7,
    name: "Meal Planning & Grocery List",
    category: "Planners & Templates",
    type: "PDF",
    status: "Generating",
    aiGenerated: true,
    marketplaces: [],
    sales: 0,
    revenue: "$0",
    generated: "12 min ago",
    thumbnail: "🍽️"
  },
  {
    id: 8,
    name: "Student Study Planner",
    category: "Planners & Templates",
    type: "PDF",
    status: "Listed",
    aiGenerated: true,
    marketplaces: ["Etsy", "Creative Market", "Gumroad"],
    sales: 89,
    revenue: "$2,403",
    generated: "1 week ago",
    thumbnail: "📚"
  },
];

const statusColors = {
  Listed: "bg-success",
  Generating: "bg-primary animate-pulse",
  Listing: "bg-accent",
};

const statusIcons = {
  Listed: CheckCircle,
  Generating: Loader2,
  Listing: Clock,
};

export function ProductsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI-Generated Products
            </h2>
            <p className="text-muted-foreground">
              Manage your autonomous digital product library
            </p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
            <Bot className="mr-2 h-4 w-4" />
            Generate New Product
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-9 bg-muted/50 border-0"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="listed">Listed</SelectItem>
                  <SelectItem value="generating">Generating</SelectItem>
                  <SelectItem value="listing">Listing</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="planners">Planners & Templates</SelectItem>
                  <SelectItem value="templates">Templates</SelectItem>
                  <SelectItem value="art">Digital Art</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Products</p>
                <h3 className="text-3xl">247</h3>
                <p className="text-xs text-success">+47 this week</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Currently Generating</p>
                <h3 className="text-3xl">23</h3>
                <p className="text-xs text-muted-foreground">5 agents active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <h3 className="text-3xl">1,847</h3>
                <p className="text-xs text-success">+12% vs last month</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <h3 className="text-3xl">$52,847</h3>
                <p className="text-xs text-success">+18% vs last month</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const StatusIcon = statusIcons[product.status as keyof typeof statusIcons];
            return (
              <Card 
                key={product.id}
                className="overflow-hidden transition-all hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-3xl">
                      {product.thumbnail}
                    </div>
                    <Badge 
                      className={statusColors[product.status as keyof typeof statusColors]}
                    >
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {product.status}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{product.name}</CardTitle>
                  <CardDescription>
                    {product.category} • {product.type}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.aiGenerated && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="h-3 w-3 text-accent" />
                      <span>AI Generated {product.generated}</span>
                    </div>
                  )}
                  
                  {product.marketplaces.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Listed on:</p>
                      <div className="flex flex-wrap gap-1">
                        {product.marketplaces.map((marketplace) => (
                          <Badge key={marketplace} variant="outline" className="text-xs">
                            {marketplace}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Not yet listed
                    </p>
                  )}

                  {product.status === "Listed" && (
                    <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Sales</p>
                        <p className="text-sm">{product.sales}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="text-sm">{product.revenue}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {product.status === "Listed" && (
                      <>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="mr-2 h-3 w-3" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="mr-2 h-3 w-3" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    {product.status === "Generating" && (
                      <Button variant="outline" size="sm" className="w-full" disabled>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Generating...
                      </Button>
                    )}
                    {product.status === "Listing" && (
                      <Button variant="outline" size="sm" className="w-full" disabled>
                        <Clock className="mr-2 h-3 w-3" />
                        Auto-listing...
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
