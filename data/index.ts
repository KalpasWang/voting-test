import { TownVoteResult, VoteResult } from "@/types";
import townsVote from "./townsVoteResult.json";
import countysVote from "./voteResult.json";
import towns_10t from "@/data/towns-mercator-10t.json";
import { Topology } from "topojson-specification";

export const townsVoteResult = townsVote as TownVoteResult[];
export const voteResult = countysVote as VoteResult;
export const districtsTopology = towns_10t as unknown as Topology;
