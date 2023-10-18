"use client";

import React from "react";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import Map from "@/components/Map";
import GeoChart from "@/components/GeoChart";
import geoData from "@/data/GeoChart.world.geo.json";
import countyData from "@/data/taiwan-county.json";
import townData from "@/data/taiwan-town.json";
import villageData from "@/data/taiwan-village.json";
import { FeatureCollection } from "geojson";
import TaiwanMap from "@/components/TaiwanMap";

export default function Home() {
  return (
    <ParentSize>
      {({ width, height }) => (
        <TaiwanMap width={width} height={height} events={true} />
      )}
    </ParentSize>
    // <>
    //   <GeoChart
    //     countyData={countyData as unknown as TopoJSON.Topology}
    //     property="pop_est"
    //   />
    // </>
  );
}
