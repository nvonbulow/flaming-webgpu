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
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  xforms: z.array(XFormSchema),

  batch_size: z.number().int().positive().default(1000),
  parallelism: z.number().int().positive().default(64),
});

export type IterationOptions = z.infer<typeof IterationOptionsSchema>;

export const PostProcessingOptionsSchema = z.object({
  gamma: z.number().min(0),
});

