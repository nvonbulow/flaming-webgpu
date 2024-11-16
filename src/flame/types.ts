import { z } from 'zod';

export const XFormSchema = z.object({
  // todo: use a string in the JS world
  variation_id: z.number(),
  affine: z.array(z.number()).length(6),
  color: z.number().min(0).max(1),
  speed: z.number(),
  weight: z.number().min(0).max(1).default(1),
});
export type XForm = z.infer<typeof XFormSchema>;

export const IterationOptionsSchema = z.object({
  // dimensions of the output image
  width: z.number().int().positive().default(800),
  height: z.number().int().positive().default(600),
  // number of bins per pixel
  supersample: z.number().int().positive().default(1),

  // image center in coodinate space
  camera_x: z.number().default(0),
  camera_y: z.number().default(0),
  // scale factor
  // 1 corresponds to an x range of (-1.0, 1.0)
  // and a y range scaled to the aspect ratio
  camera_zoom: z.number().default(1),

  // Color palette
  palette: z.lazy(() => PaletteSchema),

  // number of iterations to run per thread each batch
  batch_size: z.number().int().positive().default(1000),
  // number of threads to run in
  parallelism: z.number().int().positive().default(64),
  // maximum number of batches to run
  batch_limit: z.number().int().positive().default(100),
});
export type IterationOptions = z.infer<typeof IterationOptionsSchema>;

export const PostProcessingOptionsSchema = z.object({
  gamma: z.number().min(0),
});
export type PostProcessingOptions = z.infer<typeof PostProcessingOptionsSchema>;

export const PaletteColor = z.array(
  z.number().min(0).max(1),
).length(3);
export type PaletteColor = z.infer<typeof PaletteColor>;

export const RawPaletteSchema = z.instanceof(Float32Array)
  .refine(
    arr => arr.length % 3 === 0,
    'Palette must have a length that is a multiple of 3',
  )
  .refine(
    arr => arr.every(i => i >= 0 && i <= 1),
    'Palette must have normalized values between 0 and 1',
  );
export type RawPalette = z.infer<typeof RawPaletteSchema>;

export const PaletteSchema = z.object({
  name: z.string(),
  colors: RawPaletteSchema,
});
export type Palette = z.infer<typeof PaletteSchema>;

