"use client";

import React, { useRef, useEffect, useState } from "react";
import { select, geoPath, geoMercator, min, max, scaleLinear } from "d3";
import * as topojson from "topojson-client";
import useResizeObserver from "@/hooks/useResizeObserver";
import { Feature } from "geojson";

/**
 * Component that renders a map of Germany.
 */

type Props = {
  countyData: TopoJSON.Topology;
  property: string;
};

function GeoChart({ countyData, property }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const dimensions = useResizeObserver(wrapperRef);
  const [selectedCountry, setSelectedCountry] = useState<Feature | null>(null);

  // will be called initially and on every data change
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = select(svgRef.current);

    // get county topojson features
    const counties = topojson.feature(
      countyData,
      countyData.objects.counties as TopoJSON.GeometryCollection
    ) as CountyFeatureCollection;

    // const minProp = min(
    //   data.features,
    //   (feature) => feature.properties?.[property]
    // );
    // const maxProp = max(
    //   data.features,
    //   (feature) => feature.properties?.[property]
    // );
    // const colorScale = scaleLinear<string, number>()
    //   .domain([minProp, maxProp])
    //   .range(["#ccc", "red"]);

    // use resized dimensions
    // but fall back to getBoundingClientRect, if no dimensions yet.
    if (!dimensions) return;
    const { width, height } =
      dimensions || wrapperRef.current?.getBoundingClientRect();

    // projects geo-coordinates on a 2D plane
    const projection = geoMercator()
      .fitSize([width, height], selectedCountry || counties)
      .precision(100);

    // takes geojson data,
    // transforms that into the d attribute of a path element
    const pathGenerator = geoPath().projection(projection);

    // render each country
    svg
      .selectAll(".country")
      .data(counties.features)
      .join("path")
      .on("click", (event, feature) => {
        setSelectedCountry(selectedCountry === feature ? null : feature);
      })
      .attr("class", "country")
      .transition()
      .attr("fill", "#fff") //(feature) => colorScale(feature.properties?.[property]))
      .attr("d", (feature) => pathGenerator(feature));

    // render text
    svg
      .selectAll(".label")
      .data([selectedCountry])
      .join("text")
      .attr("class", "label")
      .text(
        (feature) =>
          feature &&
          feature.properties?.name +
            ": " +
            feature.properties?.[property].toLocaleString()
      )
      .attr("x", 10)
      .attr("y", 25);
  }, [countyData, dimensions, property, selectedCountry]);

  return (
    <div ref={wrapperRef} style={{ marginBottom: "2rem" }}>
      <svg ref={svgRef} className="block w-full h-80"></svg>
    </div>
  );
}

export default GeoChart;
