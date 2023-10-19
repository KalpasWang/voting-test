import React, { useState } from "react";
// import { scaleQuantize } from "@visx/scale";
import { Mercator, Graticule } from "@visx/geo";
import * as topojson from "topojson-client";
import { motion } from "framer-motion";
import countyTopology from "@/data/taiwan-county.json";
import townTopology from "@/data/taiwan-town.json";

export const background = "#f9f7e8";

export type GeoMercatorProps = {
  width: number;
  height: number;
  events?: boolean;
};

const counties = topojson.feature(
  countyTopology as unknown as TopoJSON.Topology,
  countyTopology.objects.counties as TopoJSON.GeometryCollection
) as {
  type: "FeatureCollection";
  features: CountyFeatureShape[];
};

console.log(counties);

// @ts-expect-error
const towns = topojson.feature(townTopology, townTopology.objects.towns) as {
  type: "FeatureCollection";
  features: TownFeatureShape[];
};

const color = (value: number) => {
  return "#ffbbdd";
};

// const color = scaleQuantize({
//   domain: [
//     Math.min(...world.features.map((f) => f.geometry.coordinates.length)),
//     Math.max(...world.features.map((f) => f.geometry.coordinates.length)),
//   ],
//   range: [
//     "#ffb01d",
//     "#ffa020",
//     "#ff9221",
//     "#ff8424",
//     "#ff7425",
//     "#fc5e2f",
//     "#f94b3a",
//     "#f63a48",
//   ],
// });

export default function TaiwanMap({
  width,
  height,
  events = false,
}: GeoMercatorProps) {
  const [selectedCounty, setSelectedCounty] =
    useState<CountyFeatureShape | null>(null);
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = 5500;

  console.log(selectedCounty);

  const renderedTowns = () => {
    return towns.features.filter(
      (town) => town.properties.countyId === selectedCounty?.properties.countyId
    );
  };

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={background}
        rx={14}
      />
      <Mercator<CountyFeatureShape>
        data={counties.features}
        scale={scale}
        translate={[centerX, centerY]}
        center={[120.751864, 23.575998]}
        // @ts-ignore
        fitSize={[[width, height], selectedCounty || counties]}
      >
        {(mercator) => (
          <motion.g transition={{ duration: 0.2 }}>
            {mercator.features.map(({ feature, path }, i) => (
              <motion.path
                key={`county-feature-${i}`}
                d={path || ""}
                fill={color(feature.geometry.coordinates.length)}
                stroke={"#000"}
                strokeWidth={1}
                transition={{ duration: 0.2, easings: "easeInOut" }}
                onClick={() => {
                  setSelectedCounty(feature);
                }}
              />
            ))}
          </motion.g>
        )}
      </Mercator>
      {selectedCounty && (
        <Mercator<TownFeatureShape>
          data={renderedTowns()}
          scale={scale}
          translate={[centerX, centerY]}
          center={[120.751864, 23.575998]}
          fitSize={[[width, height], selectedCounty || counties]}
        >
          {(mercator) => (
            <motion.g transition={{ duration: 0.2 }}>
              {mercator.features.map(({ feature, path }, i) => (
                <path
                  key={`town-feature-${i}`}
                  d={path || ""}
                  fill={color(feature.geometry.coordinates.length)}
                  stroke={"#000"}
                  strokeWidth={1}
                  onClick={() => {
                    if (events)
                      alert(
                        `Clicked: ${feature.properties.townName} (${feature.properties.townId})`
                      );
                  }}
                />
              ))}
            </motion.g>
          )}
        </Mercator>
      )}
    </svg>
  );
}
