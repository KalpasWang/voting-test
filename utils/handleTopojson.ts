import * as topojson from "topojson-client";
import countyTopology from "@/data/tw-county-topo-2020.json";

type OldCountyFeatureShape = {
  type: "Feature";
  geometry: { coordinates: [number, number][][]; type: "MultiPolygon" };
  id: string;
  properties: {
    name: string;
    color: string;
    ddp: number;
    kmt: number;
    pfp: number;
    winner_2016: string;
    winner_2018: string;
    winner_2020: string;
    winning_rate_2016: string;
    winning_rate_2018: string;
    winning_rate_2020: string;
  };
};

const counties = topojson.feature(
  countyTopology as unknown as TopoJSON.Topology,
  countyTopology.objects.counties as TopoJSON.GeometryCollection
) as unknown as {
  type: "FeatureCollection";
  features: OldCountyFeatureShape[];
};
console.log(counties);

const newFeatures = counties.features.map((feature) => {
  return {
    type: "Feature",
    id: feature.id,
    geometry: feature.geometry,
    properties: {
      countyName: feature.properties.name,
    },
  };
});

console.log({
  type: "FeatureCollection",
  features: newFeatures,
});
