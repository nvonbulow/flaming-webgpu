import { Palette } from "./types";

export function generateRainbowPalette(): Palette {
  return [
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 0],
    [0, 1, 1],
    [0, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
  ];
}

