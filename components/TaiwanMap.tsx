"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { CustomProjection, Mercator } from "@visx/geo";
import { AnimatePresence, motion } from "framer-motion";
import { TooltipWithBounds, defaultStyles, useTooltip } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { grey, lime } from "@mui/material/colors";
import { geoCentroid, geoMercator } from "d3-geo";
import * as d3 from "d3";
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
import type {
  CountyFeature,
  MapAction,
  MapState,
  TooltipDataType,
  TownFeature,
} from "@/types";
import mercatorTw from "taiwan-atlas";

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

export default function TaiwanMap({ width, height }: TaiwanMapProps) {
  const countiesRef = useRef<SVGGElement>(null);
  const countyBorderRef = useRef<SVGGElement>(null);
  const townsRef = useRef<SVGGElement>(null);
  const [state, dispatch] = useReducer(mapReducer, { currentLevel: 0 });
  const {
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
    tooltipOpen,
    showTooltip,
  } = useTooltip<TooltipDataType>({
    tooltipOpen: true,
    tooltipLeft: width / 2,
    tooltipTop: height / 2,
    tooltipData: "",
  });

  const centerX = width / 2;
  const centerY = height / 2;
  const center: [number, number] = [275, 300];
  const scale = 8000;
  const offsetX = width / 20;
  const offsetY = height / 15;
  const size: [[number, number], [number, number]] = useMemo(
    () => [
      [offsetX, offsetY],
      [width - offsetX, height - offsetY],
    ],
    [width, height, offsetX, offsetY]
  );
  const projection = mercatorTw().fitExtent(
    size,
    state.selectedDistrict || counties
  );
  const pathGenerator = d3.geoPath().projection(projection);

  // event handlers
  const handlePointerMove = useCallback(
    (event: React.PointerEvent<SVGPathElement>, data: TooltipDataType) => {
      const countyName = state.selectedCounty?.properties.countyName;
      if (countyName === data && state.currentLevel > 0) return;

      const { x, y } = localPoint(event) || { x: 0, y: 0 };
      showTooltip({
        tooltipLeft: x,
        tooltipTop: y,
        tooltipData: data,
      });
    },
    [showTooltip, state]
  );

  // render counties
  useEffect(() => {
    const g1 = d3.select(countiesRef.current);
    g1.selectAll("path")
      .data(counties.features)
      .join("path")
      .on("click", (event, feature) => {
        dispatch({
          type: "goto",
          payload: { type: "county", feature: feature },
        });
      })
      .on("pointerenter", (e, f) =>
        handlePointerMove(e, f.properties.countyName)
      )
      .on("pointerleave", (e) => handlePointerMove(e, ""))
      .transition()
      .duration(2200)
      // @ts-ignore
      .attr("fill", (feature) => countyColor(feature.properties.countyName))
      .attr("stroke", grey[200])
      .attr("stroke-width", 1)
      .attr("d", (feature) => pathGenerator(feature));
  }, [projection, pathGenerator, handlePointerMove]);

  // render selected county border
  useEffect(() => {
    const chosen = state.selectedCounty;
    const data: CountyFeature[] = chosen ? [chosen] : [];

    const g2 = d3.select(countyBorderRef.current);
    g2.selectAll<SVGPathElement, CountyFeature>("path")
      .data(data)
      .join(
        (enter) =>
          enter
            .append("path")
            .style("opacity", 0)
            .transition()
            .delay(2500)
            .style("opacity", 1),
        (update) => update.transition().duration(2200),
        (exit) => exit.remove()
      )
      .attr("fill", "none")
      .attr("stroke", lime[600])
      .attr("stroke-width", 8)
      .attr("d", (feature) => pathGenerator(feature));
  }, [state.selectedCounty, pathGenerator]);

  // render towns of the selected county
  useEffect(() => {
    const towns = state.renderedTowns;
    const data: TownFeature[] = towns ? towns : [];

    const g3 = d3.select(townsRef.current);
    g3.selectAll<SVGPathElement, TownFeature>("path")
      .data(data)
      .join(
        (enter) =>
          enter
            .append("path")
            .style("opacity", 0)
            .transition()
            .delay(2500)
            .style("opacity", 1),
        (update) => update.transition().duration(2200),
        (exit) => exit.remove()
      )
      .on("click", (event, feature) =>
        dispatch({
          type: "goto",
          payload: { type: "town", feature: feature },
        })
      )
      .attr("fill", (f) =>
        townColor(f.properties.countyName, f.properties.townName)
      )
      .attr("stroke", grey[200])
      .attr("stroke-width", 1)
      .attr("d", (feature) => pathGenerator(feature));

    // show towns name
    g3.selectAll<SVGTextElement, TownFeature>("text")
      .data(data)
      .join(
        (enter) =>
          enter
            .append("text")
            .style("opacity", 0)
            .transition()
            .delay(2500)
            .style("opacity", 1),
        (update) => update.transition().duration(2200),
        (exit) => exit.remove()
      )
      .text((f) => f.properties.townName)
      .attr("fill", (f) => getTextFill(""))
      .attr("transform", (feature) => {
        const coords: [number, number] | null = projection(
          geoCentroid(feature)
        );
        return `translate(${coords})`;
      })
      .attr("font-size", "0.8rem");
  }, [state.renderedTowns, pathGenerator, projection]);

  return (
    <div>
      <svg id="map-svg" width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill="#f9f7e8" />
        <g ref={countiesRef} className="counties"></g>
        <g ref={countyBorderRef} className="county-border"></g>
        <g ref={townsRef} className="towns"></g>
        {/* {state.selectedCounty && (
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
        )} */}
        {/* render towns of selected county*/}
        {/* {state.renderedTowns && state.selectedDistrict && (
          <AnimatePresence>
            <CustomProjection<TownFeature>
              data={state.renderedTowns}
              projection={geoMercator}
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
                          onPointerEnter={(e) =>
                            handlePointerMove(e, feature.properties.townName)
                          }
                          onPointerLeave={() => hideTooltip()}
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
        )} */}
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
      {/* show district name */}
      {/* {tooltipOpen && (
        <TooltipWithBounds
          key={Math.random()} // needed for bounds to update correctly
          left={tooltipLeft}
          top={tooltipTop}
          style={{
            ...defaultStyles,
            padding: 0,
            fontSize: "1.5rem",
          }}
        >
          {tooltipData}
        </TooltipWithBounds>
      )} */}
    </div>
  );
}
