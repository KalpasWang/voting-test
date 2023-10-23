export function getCountyVoteDifferenceRate(data: ElectionResult) {
  return data.counties.map((c) => (c.candidate3 - c.candidate2) / c.totalVotes);
}
