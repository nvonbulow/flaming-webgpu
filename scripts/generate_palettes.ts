import { XMLParser } from 'fast-xml-parser';
import { readFile } from 'fs/promises';
import { concatMap, firstValueFrom, from, map, mergeMap, toArray } from 'rxjs';
import { z } from 'zod';

const PalettesFileSchema = z.object({
  palettes: z.object({
    palette: z.array(z.object({
      '@_number': z.string(),
      '@_name': z.string(),
      '@_data': z.string(),
    })),
  }),
});

function parsePaletteData(data: string) {
  const strippedData = data.replace(/\s/g, '');

  const palette: number[][] = [];
  for (let i = 0; i < strippedData.length; i += 8) {
    const color = strippedData.slice(i, i + 8);
    const r = parseInt(color.slice(2, 4), 16);
    const g = parseInt(color.slice(4, 6), 16);
    const b = parseInt(color.slice(6, 8), 16);
    palette.push([r, g, b]);
  }

  return palette;
}

function transformPalettesFile() {
  const parser = new XMLParser({
    ignoreAttributes: false,
  });
  return from(readFile('flam3-palettes.xml', 'utf-8')).pipe(
    map(xml => parser.parse(xml, true)),
    map(parsedXml => PalettesFileSchema.parse(parsedXml)),
    mergeMap(parsedPalettes => parsedPalettes.palettes.palette),
    map(palette => ({
      name: palette['@_name'],
      data: parsePaletteData(palette['@_data']),
    })),
    // compress data
    concatMap(async palette => ({
      name: palette.name,
      data: Buffer.copyBytesFrom(new Uint8Array(palette.data.flat())),
    })),
    map(palette => ({
      name: palette.name,
      data: palette.data.toString('base64'),
    })),
  );
}

async function main() {
  const palettes$ = transformPalettesFile().pipe(
    toArray(),
  );

  const value = await firstValueFrom(palettes$);
  console.log(JSON.stringify(value, null, 2));
}

main().catch(console.error);

