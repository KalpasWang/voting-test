import { Feature, FeatureCollection, Geometry } from "geojson";

// districts type
export type District = "county" | "town";

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

export type TownVoteResult = {
  countyName: string;
  townName: string;
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
