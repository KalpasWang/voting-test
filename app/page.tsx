"use client";

import React from "react";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import TaiwanMap from "@/components/TaiwanMap";
import PercentageChart from "@/components/PercentageChart";

export default function Home() {
  return (
    <div>
      <div className="w-full h-screen">
        <ParentSize>
          {({ width, height }) => <TaiwanMap width={width} height={height} />}
        </ParentSize>
      </div>
      {/* <div className="p-5 h-10 m-auto"><PercentageChart /></div> */}
    </div>
  );
}
