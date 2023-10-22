import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
// import { scaleQuantize } from "@visx/scale";
import { Mercator, Graticule } from "@visx/geo";
import * as topojson from "topojson-client";
import { AnimatePresence, motion } from "framer-motion";
import countyTopology from "@/data/taiwan-county.json";
import townTopology from "@/data/taiwan-town.json";
import {
  TooltipWithBounds,
  defaultStyles,
  useTooltip,
  useTooltipInPortal,
} from "@visx/tooltip";

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

// console.log(counties);

// @ts-expect-error
const towns = topojson.feature(townTopology, townTopology.objects.towns) as {
  type: "FeatureCollection";
  features: TownFeatureShape[];
};

function filterTownFeatures(county: CountyFeatureShape) {
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
          state.renderedTowns?.[0].properties.countyId !==
          feature.properties.countyId
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
  const { containerRef, containerBounds, TooltipInPortal } = useTooltipInPortal(
    {
      detectBounds: true,
    }
  );

  const centerX = width / 2;
  const centerY = height / 2;
  const scale = 5500;

  // console.log(selectedCounty);

  // event handlers
  const handlePointerMove = useCallback(
    (event: React.PointerEvent<SVGPathElement>, data: TooltipDataType) => {
      // coordinates should be relative to the container in which Tooltip is rendered
      const containerX =
        ("clientX" in event ? event.clientX : 0) - containerBounds.left;
      const containerY =
        ("clientY" in event ? event.clientY : 0) - containerBounds.top;
      console.log(containerX, containerY);
      console.log(tooltipOpen);
      showTooltip({
        tooltipLeft: containerX,
        tooltipTop: containerY,
        tooltipData: data,
      });
    },
    [showTooltip, containerBounds, tooltipOpen]
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
          center={[120.751864, 24.875998]}
          // @ts-ignore
          fitSize={[[width, height], state.selectedCounty || counties]}
        >
          {(mercator) => (
            <g className="relative">
              {mercator.features.map(({ feature, path }, i) => {
                return (
                  <path
                    className="district relative"
                    key={`county-feature-${i}`}
                    d={path || ""}
                    fill={"#ff9900"}
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
                  transition={{ duration: 0.2, delay: 0.2 }}
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
