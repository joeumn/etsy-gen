import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { hour: "00:00", etsy: 45, gumroad: 32, creativeMarket: 28 },
  { hour: "04:00", etsy: 52, gumroad: 38, creativeMarket: 31 },
  { hour: "08:00", etsy: 67, gumroad: 45, creativeMarket: 39 },
  { hour: "12:00", etsy: 89, gumroad: 56, creativeMarket: 48 },
  { hour: "16:00", etsy: 78, gumroad: 52, creativeMarket: 44 },
  { hour: "20:00", etsy: 94, gumroad: 61, creativeMarket: 53 },
];

export function TrendScannerChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-Time Trend Scanner</CardTitle>
        <CardDescription>
          Opportunities discovered across marketplaces (last 24h)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
            <XAxis 
              dataKey="hour" 
              className="text-xs"
              stroke="#64748b"
            />
            <YAxis 
              className="text-xs"
              stroke="#64748b"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="etsy"
              stroke="#6366f1"
              strokeWidth={2}
              name="Etsy"
              dot={{ fill: "#6366f1", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="gumroad"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="Gumroad"
              dot={{ fill: "#8b5cf6", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="creativeMarket"
              stroke="#06b6d4"
              strokeWidth={2}
              name="Creative Market"
              dot={{ fill: "#06b6d4", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
