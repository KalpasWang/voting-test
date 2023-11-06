"use client";

import React, { useCallback, useEffect, useMemo, useReducer } from "react";
import { Mercator, CustomProjection } from "@visx/geo";
import { AnimatePresence, motion } from "framer-motion";
import { grey, lime } from "@mui/material/colors";
import {
  GeoRawProjection,
  geoCentroid,
  geoMercator,
  geoProjection,
} from "d3-geo";
import { counties, towns } from "@/utils/districtsGeoData";
import {
  getBlueWinCountys,
  getGreenWinCountys,
  getBlueWinTowns,
  getGreenWinTowns,
  getDistricColorMap,
  getTextFill,
} from "@/utils/helpers";
import { voteResult } from "@/data";
import { townsVoteResult } from "@/data";
import type { CountyFeature, MapAction, MapState, TownFeature } from "@/types";

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
    case "goto": {
      const { type, feature } = action.payload;
      if (type === "county") {
        let renderedTowns = state.renderedTowns;
        if (state.renderedTowns?.[0].id !== feature.id) {
          renderedTowns = filterTownFeatures(feature);
        }
        return {
          ...state,
          currentLevel: 1,
          currentDistrict: "county",
          selectedDistrict: feature,
          selectedCounty: feature,
          renderedTowns,
        };
      }
      if (type === "town") {
        return {
          ...state,
          currentLevel: 2,
          currentDistrict: "town",
          selectedDistrict: feature,
          selectedTown: feature,
        };
      }
      return state;
    }
    case "up": {
      const level = state.currentLevel;
      if (level === 1)
        return {
          ...state,
          currentLevel: 0,
          currentDistrict: undefined,
          selectedDistrict: undefined,
          selectedCounty: undefined,
        };
      if (level === 2)
        return {
          ...state,
          currentLevel: 1,
          currentDistrict: "county",
          selectedDistrict: state.selectedCounty,
          selectedTown: undefined,
        };
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

// projection fn
const rawProject: GeoRawProjection = function (x, y) {
  return [x, -y];
};

function myProjection() {
  return geoProjection(rawProject).precision(0).scale(2).translate([0, 0]);
}

export default function TaiwanMap({ width, height }: TaiwanMapProps) {
  const [state, dispatch] = useReducer(mapReducer, { currentLevel: 0 });
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = 1;
  const offsetX = width / 20;
  const offsetY = height / 15;
  const size: [[number, number], [number, number]] = useMemo(
    () => [
      [offsetX, offsetY],
      [width - offsetX, height - offsetY],
    ],
    [width, height, offsetX, offsetY]
  );

  useEffect(() => {
    setTimeout(() => {
      const nodes = document.getElementsByClassName("district");
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].classList.add("map-path");
      }
    }, 1000);
  });

  return (
    <div>
      <svg id="map-svg" width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill="#f9f7e8" />
        {/* render counties */}
        <CustomProjection<CountyFeature>
          data={counties.features}
          projection={myProjection}
          scale={scale}
          translate={[centerX, centerY]}
          center={[120.751864, 24.075998]}
          // @ts-ignore
          fitExtent={[size, state.selectedDistrict || counties]}
        >
          {(mercator) => (
            <g>
              {mercator.features.map(({ feature, path }, i) => {
                return (
                  <path
                    className={`district ${feature.properties.countyName}`}
                    key={`county-${i}`}
                    d={path || ""}
                    // @ts-ignore
                    fill={countyColor(feature.properties.countyName)}
                    stroke={grey[200]}
                    strokeWidth={1}
                    onClick={() =>
                      dispatch({
                        type: "goto",
                        payload: { type: "county", feature: feature },
                      })
                    }
                  ></path>
                );
              })}
            </g>
          )}
        </CustomProjection>
        {/* render selected county border */}
        {state.selectedCounty && (
          <CustomProjection<CountyFeature>
            data={[state.selectedCounty]}
            projection={geoMercator}
            scale={scale}
            translate={[centerX, centerY]}
            // center={[120.751864, 24.075998]}
            // @ts-ignore
            fitExtent={[size, state.selectedDistrict || counties]}
          >
            {(mercator) => (
              <motion.g
                key={state.selectedCounty?.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1, delay: 2 }}
              >
                {mercator.features.map(({ feature, path }, i) => {
                  return (
                    <path
                      className="district"
                      key={`county-stroke-${i}`}
                      d={path || ""}
                      fill="transparent"
                      stroke={lime[600]}
                      strokeWidth={8}
                    ></path>
                  );
                })}
              </motion.g>
            )}
          </CustomProjection>
        )}
        {/* render towns of selected county*/}
        {state.renderedTowns && state.selectedDistrict && (
          <AnimatePresence>
            <CustomProjection<TownFeature>
              data={state.renderedTowns}
              scale={scale}
              translate={[centerX, centerY]}
              // center={[120.751864, 23.575998]}
              // @ts-ignore
              fitExtent={[size, state.selectedDistrict]}
            >
              {(mercator) => (
                <motion.g
                  key={state.selectedCounty?.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1, delay: 2 }}
                >
                  {mercator.features.map(({ feature, path, projection }, i) => {
                    const coords: [number, number] | null = projection(
                      geoCentroid(feature)
                    );
                    const pathFill = townColor(
                      feature.properties.countyName,
                      feature.properties.townName
                    );

                    return (
                      <g key={`town-${i}`}>
                        <path
                          className="district selectedTown"
                          d={path || ""}
                          fill={pathFill}
                          stroke={grey[200]}
                          strokeWidth={1}
                          onClick={() =>
                            dispatch({
                              type: "goto",
                              payload: { type: "town", feature: feature },
                            })
                          }
                        ></path>
                        <text
                          className="district"
                          transform={`translate(${coords})`}
                          fontSize={Math.max(width / 75, 9)}
                          fill={getTextFill(pathFill)}
                          cursor="default"
                          textAnchor="middle"
                        >
                          {feature.properties.townName}
                        </text>
                      </g>
                    );
                  })}
                </motion.g>
              )}
            </CustomProjection>
          </AnimatePresence>
        )}
      </svg>
      {/* go back button */}
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
    </div>
  );
}
