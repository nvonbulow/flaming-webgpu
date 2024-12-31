import { getPresetPalette, IterationOptions, PostProcessingOptions, XForm } from "./flame";

export const defaultIterationOptions = (): IterationOptions => ({
  width: 800,
  height: 600,
  supersample: 2,
  palette: getPresetPalette('fire-dragon'),
  camera_x: 0,
  camera_y: 0,
  camera_zoom: 1,
  batch_size: 10000,
  parallelism: 1024,
  batch_limit: 100,
});

export const defaultPostProcessingOptions = (): PostProcessingOptions => ({
  gamma: 4.0,
});

export const defaultXforms = (): XForm[] => [{
  variation: 'linear',
  weight: 1.0,
  color: 0.0,
  speed: 0.0,
  affine: [1, 0, 0, 0, 1, 0, 0, 0, 1],
}];
