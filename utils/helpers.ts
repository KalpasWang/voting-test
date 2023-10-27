import { scaleQuantize } from "@visx/scale";
import { blue, green, grey } from "@mui/material/colors";
import electionResult from "@/data/electionResult.json";
import { CountyVoteResult, ElectionResult } from "@/types";

export function getCountyVoteDifferenceArray(data: ElectionResult) {
  return data.counties.map((c) => (c.candidate3 - c.candidate2) / c.totalVotes);
}

export function getCountyGreenWinArray(data: ElectionResult) {
  return data.counties
    .filter((c) => c.candidate3 > c.candidate2)
    .map((c) => (c.candidate3 - c.candidate2) / c.totalVotes);
}

export function getCountyBlueWinArray(data: ElectionResult) {
  return data.counties
    .filter((c) => c.candidate2 > c.candidate3)
    .map((c) => (c.candidate2 - c.candidate3) / c.totalVotes);
}

export function getDistricColorMap(GreenWin: number[], BlueWin: number[]) {
  const colorGreenWin = scaleQuantize({
    domain: [Math.min(...GreenWin), Math.max(...GreenWin)],
    range: [green[300], green[600], green[900]],
  });
  const colorBlueWin = scaleQuantize({
    domain: [Math.min(...BlueWin), Math.max(...BlueWin)],
    range: [blue[300], blue[600], blue[900]],
  });

  return (countyName: string) => {
    const county = electionResult.counties.find(
      (c) => c.countyName === countyName
    );
    if (!county) return grey[600];
    if (county.candidate3 > county.candidate2) {
      const winRate = calcGreenWinRate(county);
      return colorGreenWin(winRate);
    } else if (county.candidate2 > county.candidate3) {
      const winRate = calcBlueWinRate(county);
      return colorBlueWin(winRate);
    } else return grey[300];
  };
}

export function calcGreenWinRate(district: CountyVoteResult) {
  return (district.candidate3 - district.candidate2) / district.totalVotes;
}

export function calcBlueWinRate(district: CountyVoteResult) {
  return (district.candidate2 - district.candidate3) / district.totalVotes;
}
