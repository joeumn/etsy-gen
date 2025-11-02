import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Planners & Templates", value: 145, color: "#6366f1" },
  { name: "Digital Art", value: 112, color: "#8b5cf6" },
  { name: "eBooks & Guides", value: 98, color: "#06b6d4" },
  { name: "Printables", value: 87, color: "#10b981" },
  { name: "Fonts & Graphics", value: 72, color: "#f59e0b" },
];

export function NicheDistributionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Niche Distribution</CardTitle>
        <CardDescription>
          AI-identified opportunities by category
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={90}
              innerRadius={50}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
