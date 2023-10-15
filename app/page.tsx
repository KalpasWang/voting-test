"use client";

import React from "react";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import Map from "@/components/Map";
import GeoChart from "@/components/GeoChart";
import geoData from "@/utils/GeoChart.world.geo.json";
import { FeatureCollection } from "geojson";

export default function Home() {
  return (
    // <ParentSize>
    //   {({ width, height }) => <Map width={width} height={height} />}
    // </ParentSize>
    <>
      <GeoChart data={geoData as FeatureCollection} property="pop_est" />
    </>
  );
}
