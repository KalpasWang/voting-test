// declare module "taiwan-*.json" {
//   const data: TopoJSON.Topology;
//   export default data;
// }

// declare module "electionResult.json" {
//   const data: ElectionResult;
//   export default data;
// }

// election data type
type ElectionResult = {
  electionRegion: string;
  candidate1: number;
  candidate2: number;
  candidate3: number;
  validVotes: number;
  invalidVotes: number;
  totalVotes: number;
  totalElectors: number;
  votingRate: number;
  counties: CountyVoteResult[];
};

type CountyVoteResult = {
  countyName: string;
  candidate1: number;
  candidate2: number;
  candidate3: number;
  validVotes: number;
  invalidVotes: number;
  totalVotes: number;
  totalElectors: number;
  votingRate: number;
};

// Map type

type CountyFeatureCollection = {
  type: "FeatureCollection";
  features: CountyFeatureShape[];
};

type CountyProperty = {
  countyId: string;
  countyName: string;
  countyCode: string;
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

type CountyFeatures = FeatureCollection<Geometry, CountyProperty>;

type CountyFeatureShape = {
  type: "Feature";
  id: string;
  geometry: { coordinates: [number, number][][]; type: "Polygon" };
  properties: {
    countyId: string;
    countyName: string;
    countyCode: string;
    countyEng: string;
  };
};

type TownFeatureShape = {
  type: "Feature";
  geometry: { coordinates: [number, number][][]; type: "Polygon" };
  properties: {
    townId: string;
    townCode: string;
    countyName: string;
    townName: string;
    townEng: string;
    countyId: string;
    countyCode: string;
  };
};

type VillageFeatureShape = {
  type: "Feature";
  geometry: { coordinates: [number, number][][]; type: "Polygon" };
  properties: {
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
};
