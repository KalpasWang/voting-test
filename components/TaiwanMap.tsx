"use client";

import React, { useCallback, useEffect, useReducer } from "react";
import { Mercator } from "@visx/geo";
import { AnimatePresence, motion } from "framer-motion";
import { TooltipWithBounds, defaultStyles, useTooltip } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { counties, towns } from "@/utils/districtsGeoData";
import {
  getBlueWinCountys,
  getGreenWinCountys,
  getBlueWinTowns,
  getGreenWinTowns,
  getDistricColorMap,
} from "@/utils/helpers";
import voteResult from "@/data/voteResult.json";
import townsVoteResult from "@/data/townsVoteResult.json";
import type {
  CountyFeature,
  MapAction,
  MapState,
  TooltipDataType,
  TownFeature,
} from "@/types";
import { grey } from "@mui/material/colors";

type TaiwanMapProps = {
  width: number;
  height: number;
};

function filterTownFeatures(county: CountyFeature): TownFeature[] {
  return towns.features.filter(
    (f) => f.properties.countyId === county.properties.countyId
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
const GreenWin = getGreenWinCountys(voteResult);
const BlueWin = getBlueWinCountys(voteResult);
const countyColor = getDistricColorMap(GreenWin, BlueWin);

// get town's corresponding color
const GreenWinT = getGreenWinTowns(townsVoteResult);
const BlueWinT = getBlueWinTowns(townsVoteResult);
const townColor = getDistricColorMap(GreenWinT, BlueWinT, "town");

export default function TaiwanMap({ width, height }: TaiwanMapProps) {
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

  const centerX = width / 2;
  const centerY = height / 2;
  const scale = 1;

  useEffect(() => {
    const nodes = document.getElementsByClassName("district");
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].classList.add("map-path");
    }
  });

  // event handlers
  const handlePointerMove = useCallback(
    (event: React.PointerEvent<SVGPathElement>, data: TooltipDataType) => {
      const { x, y } = localPoint(event) || { x: 0, y: 0 };
      showTooltip({
        tooltipLeft: x,
        tooltipTop: y,
        tooltipData: data,
      });
    },
    [showTooltip]
  );

  return (
    <div>
      <svg id="map-svg" width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill="#f9f7e8" />
        <Mercator<CountyFeature>
          data={counties.features}
          scale={scale}
          translate={[centerX, centerY]}
          center={[120.751864, 24.075998]}
          // @ts-ignore
          fitSize={[[width, height], state.selectedCounty || counties]}
        >
          {(mercator) => (
            <g>
              {mercator.features.map(({ feature, path }, i) => {
                return (
                  <path
                    className="district"
                    key={`county-${i}`}
                    d={path || ""}
                    // @ts-ignore
                    fill={countyColor(feature.properties.countyName)}
                    stroke={grey[200]}
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
            <Mercator<TownFeature>
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
                      key={`town-${i}`}
                      className="district selected"
                      d={path || ""}
                      fill={townColor(
                        feature.properties.countyName,
                        feature.properties.townName
                      )}
                      stroke={grey[200]}
                      strokeWidth={1}
                      onClick={() => {
                        alert(`Clicked: ${feature.properties.townName}`);
                      }}
                    ></path>
                  ))}
                </motion.g>
              )}
            </Mercator>
          </AnimatePresence>
        )}
      </svg>
      {state.currentLevel > 0 && (
        <button
          className="bg-black text-gray-50 absolute top-2 left-2"
          style={{
            display: state.currentLevel === 0 ? "none" : "inline-block",
          }}
          onClick={() => dispatch({ type: "up" })}
        >
          back
        </button>
      )}
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
