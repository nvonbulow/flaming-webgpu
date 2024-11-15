import React, { Gather, LC, LiveElement, Provide, useMemo, useResource } from "@use-gpu/live";
import { ComputeBuffer, Kernel, RawData, RawTexture, RenderContext, Stage, StructData, Suspense, TextureBuffer, useDeviceContext } from "@use-gpu/workbench";
import { generateRainbowPalette, getCameraMatrix, IterationOptions, normalizeXForms, PostProcessingOptions, XForm } from "~/flame";

import { main as generatePoints } from './wgsl/generate_points.wgsl';
import { main as downsampleHistogram } from './wgsl/histogram_supersample.wgsl';
import { main as histogramMax } from './wgsl/histogram_max.wgsl';
import { main as renderHistogram } from './wgsl/histogram_render.wgsl';
import { XForm as GpuXForm } from './wgsl/types.wgsl';
import { clearBuffer, StorageTarget } from "@use-gpu/core";

import { ComputeLoop } from "./ComputeLoop";

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

  const normalizedXForms = useMemo(() => normalizeXForms(xforms), [xforms]);

  const cameraMatrix = useMemo(() =>
    getCameraMatrix({
      viewportSize: [
        iterationOptions.width * iterationOptions.supersample,
        iterationOptions.height * iterationOptions.supersample,
      ],
      camera: [
        iterationOptions.camera_x,
        iterationOptions.camera_y,
        iterationOptions.camera_zoom,
      ],
    }),
    [iterationOptions],
  );

  const palette = useMemo(() => generateRainbowPalette(), []);

  const paletteData = useMemo(() => 
    palette.flat(),
  [palette]);

  return (
    <Provide context={RenderContext} value={{ width: iterationOptions.width, height: iterationOptions.height }}>
      <Gather
        children={[
          // xforms
          <StructData
            key="xforms"
            format="array<T>"
            type={GpuXForm as any}
            data={normalizedXForms}
          />,
          // histogram
          <ComputeBuffer
            key="histogram"
            label="histogram"
            // HistogramBucket type
            format="vec4<u32>"
            resolution={iterationOptions.supersample}
          />,
          // downsampled histogram
          <ComputeBuffer
            key="downsampled_histogram"
            label="downsampled_histogram"
            // HistogramBucket type
            format="vec4<u32>"
            width={iterationOptions.width}
            height={iterationOptions.height}
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
            format="rgba32float"
            width={iterationOptions.width}
            height={iterationOptions.height}
          />,
          <RawData
            key="palette"
            data={paletteData}
            length={palette.length}
            format="vec3<f32>"
          />,
        ]}
        then={([
          xforms_buf,
          histogram_buf,
          downsampled_histogram_buf,
          histogram_max_buf,
          texture_out,
          palette_buf,
        ]: StorageTarget[]) => {
          console.log('palette_buf', palette_buf);
          const device = useDeviceContext();
          return <>
            <ComputeLoop
              live={live}
              batch={1}
              limit={iterationOptions.batch_limit}
              continued
              then={(tick) => (onRenderBatch?.(tick), null)}
            >
              {(tick, resetCount) => {
                useResource(() => {
                  clearBuffer(device, histogram_buf.buffer);
                  resetCount();
                }, [iterationOptions, postProcessOptions, normalizedXForms]);
                return (
                  <Suspense>
                    <Stage targets={[histogram_buf, palette]}>
                      <Kernel
                        sources={[xforms_buf, palette_buf]}
                        shader={generatePoints as any}
                        args={[
                          tick,
                          // histogram size
                          [
                            iterationOptions.width * iterationOptions.supersample,
                            iterationOptions.height * iterationOptions.supersample
                          ],
                          // scale matrix
                          cameraMatrix,
                          iterationOptions.batch_size,
                          palette.length,
                        ]}
                        // number of threads
                        size={[iterationOptions.parallelism]}
                      />
                    </Stage>
                    <Stage target={downsampled_histogram_buf}>
                      <Kernel
                        source={histogram_buf}
                        shader={downsampleHistogram as any}
                        size={downsampled_histogram_buf.size}
                        args={[iterationOptions.supersample]}
                      />
                    </Stage>
                    <Stage target={histogram_max_buf}>
                      <Kernel
                        source={downsampled_histogram_buf}
                        shader={histogramMax as any}
                        // 64 threads
                        size={[iterationOptions.parallelism]}
                        args={[histogram_buf.size]}
                      />
                    </Stage>
                    <Stage targets={[texture_out]}>
                      <Kernel
                        sources={[downsampled_histogram_buf, histogram_max_buf]}
                        shader={renderHistogram as any}
                        args={[
                          postProcessOptions.gamma,
                        ]}
                        size={texture_out.size}
                      />
                    </Stage>
                  </Suspense>
                );
              }}
            </ComputeLoop>
            {children(texture_out)}
          </>;
        }}
      />
    </Provide>
  );
};
