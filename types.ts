import { Feature, FeatureCollection, Geometry } from "geojson";

// election data type
export type ElectionResult = {
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

export type CountyVoteResult = {
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
export type CountyFeatureCollection = {
  type: "FeatureCollection";
  features: CountyFeatureShape[];
};

export type CountyProperty = {
  countyId: string;
  countyName: string;
  countyCode: string;
  countyEng: string;
};

export type TownProperty = {
  townId: string;
  townCode: string;
  countyName: string;
  townName: string;
  townEng: string;
  countyId: string;
  countyCode: string;
};

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

export type CountyFeatures = FeatureCollection<Geometry, CountyProperty>;
export type TownFeatures = FeatureCollection<Geometry, TownProperty>;
export type CountyFeature = Feature<Geometry, CountyProperty>;
export type TownFeature = Feature<Geometry, TownProperty>;

// map reducer type
export type MapState = {
  currentLevel: 0 | 1 | 2 | 3;
  selectedCounty?: CountyFeature;
  selectedTown?: TownFeature;
  renderedTowns?: TownFeature[];
  // selectedVillage?: VillageFeatureShape;
  // renderedVillages?: VillageFeatureShape[];
};

export type MapAction =
  | {
      type: "down";
      payload:
        | { type: "county"; feature: CountyFeature }
        | { type: "town"; feature: TownFeature };
      // | { type: "village"; feature: VillageFeatures };
    }
  | {
      type: "up";
    };

export type TooltipDataType = string;
