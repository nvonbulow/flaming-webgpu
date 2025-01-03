import React, { Gather, LC, LiveElement, Provide, useMemo, useResource } from "@use-gpu/live";
import { ComputeBuffer, Kernel, RawData, RenderContext, Stage, StructData, Suspense, TextureBuffer, useDeviceContext } from "@use-gpu/workbench";
import { getCameraMatrix, IterationOptions, normalizeXForms, PostProcessingOptions, XForm } from "~/flame";

import { main as generatePoints } from './wgsl/generate_points.wgsl';
import { main as downsampleHistogram } from './wgsl/histogram_supersample.wgsl';
import { main as histogramMax } from './wgsl/histogram_max.wgsl';
import { main as renderHistogram } from './wgsl/histogram_render.wgsl';
import { XForm as GpuXForm } from './wgsl/types.wgsl';
import { clearBuffer, StorageTarget } from "@use-gpu/core";

import { ComputeLoop } from "./ComputeLoop";

const variationIdMap = {
  linear: 0,
  sinusoidal: 1,
  spherical: 2,
  swirl: 3,
  horseshoe: 4,
  polar: 5,
  handkerchief: 6,
  heart: 7,
  disc: 8,
  spiral: 9,
  hyperbolic: 10,
  diamond: 11,
  ex: 12,
  julia: 13,
  bent: 14,
  waves: 15,
  fisheye: 16,
  popcorn: 17,
  exponential: 18,
  power: 19,
  cosine: 20,
  rings: 21,
  fan: 22,
};

export interface FractalRendererProps {
  xforms: XForm[];
  iterationOptions: IterationOptions;
  postProcessOptions: PostProcessingOptions;
  children: (texture: StorageTarget) => LiveElement<any>;
  live?: boolean;
  onRenderBatch?: (count: number) => void;
};

export const FractalRendererPipeline: LC<FractalRendererProps> = ({
  xforms: xforms,
  iterationOptions,
  postProcessOptions,
  children,
  live = true,
  onRenderBatch,
}) => {

  const {
    width, height, supersample,
    palette: { colors: palette },
    camera_x, camera_y, camera_zoom,
    batch_size, batch_limit, parallelism,
  } = iterationOptions;

  const xformData = useMemo(() => normalizeXForms(xforms).map(xf => ({
    ...xf,
    variation: undefined,
    variation_id: variationIdMap[xf.variation] || 0,
  })), [xforms]);

  const cameraMatrix = useMemo(() =>
    getCameraMatrix({
      viewportSize: [
        width * supersample,
        height * supersample,
      ],
      camera: [
        camera_x,
        camera_y,
        camera_zoom,
      ],
    }),
    [width, height, supersample, camera_x, camera_y, camera_zoom],
  );

  return (
    <Provide context={RenderContext} value={{ width, height }}>
      <Gather
        children={[
          // xforms
          <StructData
            key="xforms"
            format="array<T>"
            type={GpuXForm as any}
            data={xformData}
          />,
          // histogram
          <ComputeBuffer
            key="histogram"
            label="histogram"
            // HistogramBucket type
            format="vec4<u32>"
            resolution={supersample}
          />,
          // downsampled histogram
          <ComputeBuffer
            key="downsampled_histogram"
            label="downsampled_histogram"
            // HistogramBucket type
            format="vec4<u32>"
            width={width}
            height={height}
          />,
          <ComputeBuffer
            key="histogram_max"
            format="u32"
            label="histogram_max"
            width={1}
            height={1}
            depth={1}
          />,
          <TextureBuffer
            key="texture"
            label="Rendered Histogram"
            format="rgba32float"
            width={width}
            height={height}
          />,
          <RawData
            key="palette"
            data={palette}
            length={palette.length / 3}
            format="vec3<f32>"
          />,
        ]}
        then={([
          xforms_buf,
          histogram_buf,
          downsampled_histogram_buf,
          histogram_max_buf,
          rendered_hist,
          palette_buf,
        ]: StorageTarget[]) => {
          const device = useDeviceContext();
          return <>
            <ComputeLoop
              live={live}
              batch={1}
              limit={batch_limit}
              continued
              then={(tick) => (onRenderBatch?.(tick), null)}
            >
              {(tick, resetCount) => {
                useResource(() => {
                  clearBuffer(device, histogram_buf.buffer);
                  resetCount();
                }, [iterationOptions, postProcessOptions, xformData]);
                return (
                  <Suspense>
                    <Stage targets={[histogram_buf]}>
                      <Kernel
                        sources={[xforms_buf, palette_buf]}
                        shader={generatePoints as any}
                        args={[
                          tick,
                          // histogram size
                          [
                            width * supersample,
                            height * supersample
                          ],
                          // scale matrix
                          cameraMatrix,
                          batch_size,
                          palette.length / 3,
                        ]}
                        // number of threads
                        size={[parallelism]}
                      />
                    </Stage>
                    <Stage target={downsampled_histogram_buf}>
                      <Kernel
                        source={histogram_buf}
                        shader={downsampleHistogram as any}
                        size={downsampled_histogram_buf.size}
                        args={[supersample]}
                      />
                    </Stage>
                    <Stage target={histogram_max_buf}>
                      <Kernel
                        source={downsampled_histogram_buf}
                        shader={histogramMax as any}
                        // 64 threads
                        size={[parallelism]}
                        args={[histogram_buf.size]}
                      />
                    </Stage>
                    <Stage targets={[rendered_hist]}>
                      <Kernel
                        sources={[downsampled_histogram_buf, histogram_max_buf]}
                        shader={renderHistogram as any}
                        args={[
                          postProcessOptions.gamma,
                        ]}
                        size={rendered_hist.size}
                      />
                    </Stage>
                  </Suspense>
                );
              }}
            </ComputeLoop>
            {children(rendered_hist)}
          </>;
        }}
      />
    </Provide>
  );
};
