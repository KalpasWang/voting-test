declare module "*.json" {
  const data: TopoJSON.Topology;
  export default data;
}

type CountyFeatureCollection = {
  type: "FeatureCollection";
  features: CountyFeatureShape[];
};

type CountyFeatureShape = {
  type: "Feature";
  geometry: { coordinates: [number, number][][]; type: "Polygon" };
  properties: CountyProperty;
};

type TownFeatureShape = {
  type: "Feature";
  geometry: { coordinates: [number, number][][]; type: "Polygon" };
  properties: TownProperty;
};

type CountyProperty = {
  countyId: string;
  countyCode: string;
  countyName: string;
  countyEng: string;
};

type TownProperty = {
  townId: string;
  townCode: string;
  countyName: string;
  townName: string;
  townEng: string;
  countyId: string;
  countyCode: string;
};

type VillageProperty = {
  villCode: string;
  countyName: string;
  townName: string;
  villName: string;
  villEng: string;
  countyId: string;
  countyCode: string;
  townId: string;
  townCode: string;
  note: string;
};
