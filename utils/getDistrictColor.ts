import { scaleQuantize } from "@visx/scale";
import { blue, green } from "@mui/material/colors";
import electionResult from "@/data/electionResult.json";

function getDistricColorMap(GreenWin: number[], BlueWin: number[]) {
  const colorGreenWin = scaleQuantize({
    domain: [Math.min(...GreenWin), Math.max(...GreenWin)],
    range: [green[300], green[600], green[900]],
  });
  const colorBlueWin = scaleQuantize({
    domain: [Math.min(...BlueWin), Math.max(...BlueWin)],
    range: [blue[300], blue[600], blue[900]],
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
