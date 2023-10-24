import { scaleQuantize } from "@visx/scale";
import electionResult from "@/data/electionResult.json";

function getDistricColorMap(GreenWin: number[], BlueWin: number[]) {
  const colorGreenWin = scaleQuantize({
    domain: [Math.min(...GreenWin), Math.max(...GreenWin)],
    range: ["#c8e6c9", "#81c784", "#4caf50", "#388e3c", "#1b5e20"],
  });
  const colorBlueWin = scaleQuantize({
    domain: [Math.min(...BlueWin), Math.max(...BlueWin)],
    range: ["#bbdefb", "#64b5f6", "#2196f3", "#1976d2", "#0d47a1"],
  });

  return (countyName: string) => {
    const area = electionResult.counties.find(
      (c) => c.countyName === countyName
    );
    if (!area) return "#111";
    if (area.candidate3 > area.candidate2) {
      const winRate = (area.candidate3 - area.candidate2) / area.totalVotes;
      return colorGreenWin(winRate);
    } else if (area.candidate2 > area.candidate3) {
      const winRate = (area.candidate2 - area.candidate3) / area.totalVotes;
      return colorBlueWin(winRate);
    } else return "#f5f5f5";
  };
}

export default getDistricColorMap;
