import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { marketplace: "Etsy", revenue: 12450, products: 234, conversion: 3.2 },
  { marketplace: "Gumroad", revenue: 8920, products: 156, conversion: 4.8 },
  { marketplace: "Creative Market", revenue: 7650, products: 189, conversion: 3.9 },
  { marketplace: "Envato", revenue: 6230, products: 143, conversion: 2.7 },
  { marketplace: "Shopify", revenue: 5890, products: 167, conversion: 3.1 },
];

export function MarketplacePerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Marketplace Revenue</CardTitle>
        <CardDescription>
          Performance by platform (last 30 days)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
            <XAxis 
              type="number"
              className="text-xs"
              stroke="#64748b"
            />
            <YAxis 
              dataKey="marketplace"
              type="category"
              className="text-xs"
              stroke="#64748b"
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number) => `$${value.toLocaleString()}`}
            />
            <Legend />
            <Bar 
              dataKey="revenue" 
              fill="#6366f1" 
              name="Revenue ($)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
