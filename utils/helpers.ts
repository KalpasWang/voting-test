import { ElectionResult } from "@/types";

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
