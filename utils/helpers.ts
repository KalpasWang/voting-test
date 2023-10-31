import { scaleQuantile } from "@visx/scale";
import { blue, green, grey } from "@mui/material/colors";
import voteResult from "@/data/voteResult.json";
import { townsVoteResult } from "@/data";
import {
  CountyVoteResult,
  District,
  VoteResult,
  TownVoteResult,
} from "@/types";

export function getGreenWinCountys(data: VoteResult) {
  return data.counties
    .filter((c) => c.candidate3 > c.candidate2)
    .map((c) => (c.candidate3 - c.candidate2) / c.totalVotes);
}

export function getBlueWinCountys(data: VoteResult) {
  return data.counties
    .filter((c) => c.candidate2 > c.candidate3)
    .map((c) => (c.candidate2 - c.candidate3) / c.totalVotes);
}

export function getGreenWinTowns(data: TownVoteResult[]) {
  return data
    .filter((t) => t.candidate3 > t.candidate2)
    .map((t) => (t.candidate3 - t.candidate2) / t.totalVotes);
}

export function getBlueWinTowns(data: TownVoteResult[]) {
  return data
    .filter((t) => t.candidate2 > t.candidate3)
    .map((t) => (t.candidate2 - t.candidate3) / t.totalVotes);
}

export function getDistricColorMap(
  GreenWin: number[],
  BlueWin: number[],
  district: District = "county"
) {
  const colorGreenWin = scaleQuantile({
    domain: [Math.min(...GreenWin), Math.max(...GreenWin)],
    range: [green[200], green[400], green[600], green[800]],
  });

  const colorBlueWin = scaleQuantile({
    domain: [Math.min(...BlueWin), Math.max(...BlueWin)],
    range: [blue[200], blue[400], blue[600], blue[800]],
  });

  function getCountyColor(countyName: string) {
    const county = voteResult.counties.find((c) => c.countyName === countyName);
    return mapColor(county);
  }

  function getTownColor(countyName: string, townName: string) {
    const town = townsVoteResult.find(
      (t) => t.countyName === countyName && t.townName === townName
    );
    return mapColor(town);
  }

  function mapColor(district: CountyVoteResult | TownVoteResult | undefined) {
    if (!district) return grey[500];
    if (district.candidate3 > district.candidate2) {
      const winRate = calcGreenWinRate(district);
      return colorGreenWin(winRate);
    } else if (district.candidate2 > district.candidate3) {
      const winRate = calcBlueWinRate(district);
      return colorBlueWin(winRate);
    } else return grey[500];
  }

  if (district === "county") return getCountyColor;
  if (district === "town") return getTownColor;
  return () => grey[500];
}

export function calcGreenWinRate(district: CountyVoteResult) {
  return (district.candidate3 - district.candidate2) / district.totalVotes;
}

export function calcBlueWinRate(district: CountyVoteResult) {
  return (district.candidate2 - district.candidate3) / district.totalVotes;
}

export function getTextFill(pathFill: string) {
  switch (pathFill) {
    case green[800]:
    case blue[800]:
      return grey[200];
    case green[600]:
    case blue[600]:
      return grey[50];
    case green[400]:
    case blue[400]:
      return grey[900];
    case green[200]:
    case blue[200]:
      return grey[900];
    default:
      return grey[500]; // default fill is grey 900.
  }
}
