import * as topojson from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import districtsTopology from "@/data/towns-10t.json";
import { CountyProperty, TownProperty } from "@/types";

export const counties = topojson.feature<CountyProperty>(
  districtsTopology as unknown as Topology,
  districtsTopology.objects.counties as GeometryCollection<CountyProperty>
);

export const towns = topojson.feature<TownProperty>(
  districtsTopology as unknown as Topology,
  districtsTopology.objects.towns as GeometryCollection<TownProperty>
);
