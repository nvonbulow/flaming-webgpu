import { Palette, PaletteSchema, RawPalette } from "./types";
import presetPalettes from './palettes.json';

export function generateRainbowPalette(): RawPalette {
  return new Float32Array([
    1, 0, 0,
    1, 1, 0,
    0, 1, 0,
    0, 1, 1,
    0, 0, 1,
    1, 0, 1,
  ]);
}

function parsePaletteData(encodedData: string): RawPalette {
  // Base64 encoded uint8 array
  const data = Uint8Array.from(atob(encodedData), c => c.charCodeAt(0));
  // Convert to normalized float32 array
  return new Float32Array(data).map(i => i / 255);
}

export function getPalette(name: string): Palette | undefined {
  if (name === 'rainbow') {
    return {
      name,
      colors: generateRainbowPalette(),
    };
  }
  const preset = presetPalettes.find(p => p.name === name);
  return PaletteSchema.parse({
    name,
    colors: parsePaletteData(preset.data),
  });
}


