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

type VillageFeatureShape = {
  type: "Feature";
  geometry: { coordinates: [number, number][][]; type: "Polygon" };
  properties: VillageProperty;
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

type MapState = {
  currentLevel: 0 | 1 | 2 | 3;
  selectedCounty?: CountyFeatureShape;
  selectedTown?: TownFeatureShape;
  selectedVillage?: VillageFeatureShape;
  renderedTowns?: TownFeatureShape[];
  renderedVillages?: VillageFeatureShape[];
};

type MapAction =
  | {
      type: "down";
      payload:
        | { type: "county"; feature: CountyFeatureShape }
        | { type: "town"; feature: TownFeatureShape }
        | { type: "village"; feature: VillageFeatureShape };
    }
  | {
      type: "up";
    };

type TooltipDataType = string;
