"use client";

import React from "react";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

const data = [{ name: "L1", value: 25 }];

const circleSize = 200;

export default function PercentageChart() {
  return (
    <RadialBarChart
      width={circleSize}
      height={circleSize}
      cx={circleSize / 2}
      cy={circleSize / 2}
      innerRadius={70}
      outerRadius={90}
      barSize={20}
      data={data}
      startAngle={90}
      endAngle={-270}
    >
      <PolarAngleAxis
        type="number"
        domain={[0, 100]}
        angleAxisId={0}
        tick={false}
      />
      <RadialBar
        background
        // @ts-ignore
        clockwise
        dataKey="value"
        cornerRadius={10}
        fill="#82ca9d"
      />
      <text
        x={circleSize / 2}
        y={circleSize / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className="progress-label"
      >
        25
      </text>
    </RadialBarChart>
  );
}
