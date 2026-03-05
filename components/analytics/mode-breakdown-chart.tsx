"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface ModeBreakdownChartProps {
  learnCount: number;
  matchCount: number;
}

export function ModeBreakdownChart({ learnCount, matchCount }: ModeBreakdownChartProps) {
  const total = learnCount + matchCount;
  
  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Practice Modes</CardTitle>
          <CardDescription>Sessions by mode</CardDescription>
        </CardHeader>
        <CardContent className="h-62.5 flex items-center justify-center text-sm text-muted-foreground">
          No mode data available yet.
        </CardContent>
      </Card>
    );
  }

  const data = [
    { name: "Learn Mode", value: learnCount, color: "hsl(var(--chart-1, 220 70% 50%))" },
    { name: "Match Mode", value: matchCount, color: "hsl(var(--chart-2, 340 70% 50%))" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Practice Modes</CardTitle>
        <CardDescription>Sessions by mode</CardDescription>
      </CardHeader>
      <CardContent className="h-62.5 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--background))", 
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
                color: "hsl(var(--foreground))"
              }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
