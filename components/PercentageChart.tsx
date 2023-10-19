"use client";

import React from "react";
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Group A", value: 400 },
  { name: "Group B", value: 300 },
  { name: "Group C", value: 300 },
  { name: "Group D", value: 200 },
  { name: "Group E", value: 278 },
  { name: "Group F", value: 189 },
];

export default function PercentageChart() {
  return (
    <PieChart width={400} height={400}>
      <Pie
        dataKey="value"
        startAngle={180}
        endAngle={-90}
        data={data}
        cx="50%"
        cy="50%"
        outerRadius={80}
        innerRadius={40}
        rx={10}
        ry={10}
        fill="#8884d8"
      />
    </PieChart>
  );
}
