import React from "react";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import countyData from "@/data/taiwan-county.json";
import townData from "@/data/taiwan-town.json";
import villageData from "@/data/taiwan-village.json";
import { FeatureCollection } from "geojson";
import TaiwanMap from "@/components/TaiwanMap";
import PercentageChart from "@/components/PercentageChart";

export default function Home() {
  return (
    <div>
      <div className="w-full h-screen">
        <ParentSize>
          {({ width, height }) => (
            <TaiwanMap width={width} height={height} events={true} />
          )}
        </ParentSize>
      </div>
      {/* <div className="p-5 h-10 m-auto"><PercentageChart /></div> */}
    </div>
  );
}
