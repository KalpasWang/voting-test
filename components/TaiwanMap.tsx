"use client";

import React, { useCallback, useReducer } from "react";
import { Mercator } from "@visx/geo";
import * as topojson from "topojson-client";
import { AnimatePresence, motion } from "framer-motion";
import {
  TooltipWithBounds,
  defaultStyles,
  useTooltip,
  useTooltipInPortal,
} from "@visx/tooltip";
import { getCountyBlueWinArray, getCountyGreenWinArray } from "@/utils/helpers";
import countyTopology from "@/data/taiwan-county.json";
import townTopology from "@/data/taiwan-town.json";
import electionResult from "@/data/electionResult.json";
import getDistricColorMap from "@/utils/getDistrictColor";

export type GeoMercatorProps = {
  width: number;
  height: number;
  events?: boolean;
};

const counties = topojson.feature(
  countyTopology as unknown as TopoJSON.Topology,
  countyTopology.objects.counties as TopoJSON.GeometryCollection
) as unknown as {
  type: "FeatureCollection";
  features: CountyFeatureShape[];
};

// console.log(counties);

// @ts-expect-error
const towns = topojson.feature(townTopology, townTopology.objects.towns) as {
  type: "FeatureCollection";
  features: TownFeatureShape[];
};

function filterTownFeatures(county: CountyFeatureShape) {
  return towns.features.filter(
    (f) => f.properties.countyName === county.properties.countyName
  );
}

function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case "down": {
      const level = state.currentLevel;
      const { type, feature } = action.payload;
      if (level === 1) return state;
      if (level === 0 && type === "county") {
        let renderedTowns = state.renderedTowns;
        if (
          state.renderedTowns?.[0].properties.countyName !==
          feature.properties.countyName
        ) {
          renderedTowns = filterTownFeatures(feature);
        }
        return {
          ...state,
          currentLevel: 1,
          selectedCounty: feature,
          renderedTowns,
        };
      }
      return state;
    }
    case "up": {
      const level = state.currentLevel;
      if (level === 0) return state;
      if (level === 1)
        return { ...state, currentLevel: 0, selectedCounty: undefined };
      return state;
    }
    default:
      return state;
  }
}

// get county's corresponding color
const GreenWin = getCountyGreenWinArray(electionResult);
const BlueWin = getCountyBlueWinArray(electionResult);
const colors = getDistricColorMap(GreenWin, BlueWin);

export default function TaiwanMap({
  width,
  height,
  events = false,
}: GeoMercatorProps) {
  const [state, dispatch] = useReducer(mapReducer, { currentLevel: 0 });
  const {
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<TooltipDataType>({
    tooltipOpen: true,
    tooltipLeft: width / 2,
    tooltipTop: height / 2,
    tooltipData: "",
  });
  const { containerRef, containerBounds } = useTooltipInPortal({
    detectBounds: true,
  });

  const centerX = width / 2;
  const centerY = height / 2;
  const scale = 9000;
  const props: any = {
    fitSize: state.selectedCounty
      ? [[width, height], state.selectedCounty]
      : undefined,
  };

  // console.log(selectedCounty);

  // event handlers
  const handlePointerMove = useCallback(
    (event: React.PointerEvent<SVGPathElement>, data: TooltipDataType) => {
      // coordinates should be relative to the container in which Tooltip is rendered
      const containerX =
        ("clientX" in event ? event.clientX : 0) - containerBounds.left;
      const containerY =
        ("clientY" in event ? event.clientY : 0) - containerBounds.top;
      showTooltip({
        tooltipLeft: containerX,
        tooltipTop: containerY,
        tooltipData: data,
      });
    },
    [showTooltip, containerBounds]
  );

  return (
    <div
      ref={containerRef}
      style={{ minWidth: width, minHeight: height }}
      className="relative"
    >
      <svg id="map-svg" width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill="#f9f7e8" />
        <Mercator<CountyFeatureShape>
          data={counties.features}
          scale={scale}
          translate={[centerX, centerY]}
          center={[120.751864, 24.075998]}
          // @ts-ignore
          fitSize={[[width, height], counties]}
        >
          {(mercator) => (
            <g className="relative">
              {mercator.features.map(({ feature, path }, i) => {
                return (
                  <path
                    className="district relative"
                    key={`county-feature-${i}`}
                    d={path || ""}
                    fill={colors(feature.properties.countyName)}
                    stroke={"#000"}
                    strokeWidth={1}
                    onClick={() =>
                      dispatch({
                        type: "down",
                        payload: { type: "county", feature: feature },
                      })
                    }
                    onPointerEnter={(e) =>
                      handlePointerMove(e, feature.properties.countyName)
                    }
                    onPointerLeave={() => hideTooltip()}
                  ></path>
                );
              })}
            </g>
          )}
        </Mercator>
        {state.renderedTowns && state.selectedCounty && (
          <AnimatePresence>
            <Mercator<TownFeatureShape>
              data={state.renderedTowns}
              scale={scale}
              translate={[centerX, centerY]}
              center={[120.751864, 23.575998]}
              fitSize={[[width, height], state.selectedCounty]}
            >
              {(mercator) => (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.4 }}
                >
                  {mercator.features.map(({ feature, path }, i) => (
                    <path
                      key={`town-feature-${i}`}
                      className="district relative selected"
                      d={path || ""}
                      fill={"#f0f0f0"}
                      stroke={"#000"}
                      strokeWidth={1}
                      onClick={() => {
                        if (events)
                          alert(
                            `Clicked: ${feature.properties.townName} (${feature.properties.townId})`
                          );
                      }}
                    ></path>
                  ))}
                </motion.g>
              )}
            </Mercator>
          </AnimatePresence>
        )}
      </svg>
      <button
        className="bg-black text-gray-50 absolute top-2 left-2"
        style={{ display: state.currentLevel === 0 ? "none" : "inline-block" }}
        onClick={() => dispatch({ type: "up" })}
      >
        back
      </button>
      {tooltipOpen && (
        <TooltipWithBounds
          key={Math.random()} // needed for bounds to update correctly
          left={tooltipLeft}
          top={tooltipTop}
          style={defaultStyles}
        >
          {tooltipData}
        </TooltipWithBounds>
      )}
    </div>
  );
}
