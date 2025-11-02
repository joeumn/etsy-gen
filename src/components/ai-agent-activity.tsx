import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { agent: "Agent-01", generating: 12, completed: 34, failed: 2 },
  { agent: "Agent-02", generating: 8, completed: 41, failed: 1 },
  { agent: "Agent-03", generating: 15, completed: 28, failed: 3 },
  { agent: "Agent-04", generating: 10, completed: 37, failed: 1 },
  { agent: "Agent-05", generating: 6, completed: 45, failed: 0 },
];

export function AIAgentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Agent Performance</CardTitle>
        <CardDescription>
          Product generation activity by agent
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
            <XAxis 
              dataKey="agent" 
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
            <Bar 
              dataKey="completed" 
              fill="#10b981" 
              name="Completed" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="generating" 
              fill="#6366f1" 
              name="Generating" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="failed" 
              fill="#ef4444" 
              name="Failed" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
