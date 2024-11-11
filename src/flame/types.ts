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
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  // number of bins per pixel
  supersample: z.number().int().positive().default(1),

  // ranges in coordinate space covererd by the image
  x_range: z.array(z.number()).length(2),
  y_range: z.array(z.number()).length(2),

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

