import React, { Gather, LC, LiveElement, Provide, useResource } from "@use-gpu/live";
import { ComputeBuffer, Kernel, RenderContext, Stage, StructData, Suspense, TextureBuffer, useAnimationFrame, useDeviceContext } from "@use-gpu/workbench";
import { IterationOptions, PostProcessingOptions, XForm } from "~/flame";

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
  xforms,
  iterationOptions,
  postProcessOptions,
  children,
  live = true,
  onRenderBatch,
}) => {

  return (
    <Provide context={RenderContext} value={{ width: iterationOptions.width, height: iterationOptions.height }}>
      <Gather
        children={[
          // xforms
          <StructData
            key="xforms"
            format="array<T>"
            type={GpuXForm}
            data={xforms}
          />,
          // histogram
          <ComputeBuffer
            key="histogram"
            label="histogram"
            // HistogramBucket type
            format="vec4<u32>"
            width={iterationOptions.width * iterationOptions.supersample}
            height={iterationOptions.height * iterationOptions.supersample}
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
          <ComputeBuffer
            key="textureBuf"
            format="vec4<f32>"
            width={iterationOptions.width}
            height={iterationOptions.height}
          />,
        ]}
        then={([
          xforms_in,
          histogram,
          downsampled_histogram,
          histogram_max,
          texture,
          textureBuf,
        ]: StorageTarget[]) => {

          const device = useDeviceContext();
          return <>
            <ComputeLoop
              live={live}
              batch={1}
              limit={iterationOptions.batch_limit}
              continued
              then={(tick) => onRenderBatch?.(tick)}
            >
              {(tick, resetCount) => {
                useResource(() => {
                  clearBuffer(device, histogram.buffer);
                  resetCount();
                }, [iterationOptions, postProcessOptions, xforms]);
                return (
                  <Suspense>
                    <Stage targets={[histogram]}>
                      <Kernel
                        sources={[xforms_in]}
                        shader={generatePoints}
                        args={[
                          tick,
                          [iterationOptions.width * iterationOptions.supersample, iterationOptions.height * iterationOptions.supersample],
                          iterationOptions.x_range,
                          iterationOptions.y_range,
                          iterationOptions.batch_size,
                        ]}
                        // number of threads
                        size={[iterationOptions.parallelism]}
                      />
                    </Stage>
                    <Stage target={downsampled_histogram}>
                      <Kernel
                        source={histogram}
                        shader={downsampleHistogram}
                        size={downsampled_histogram.size}
                        args={[iterationOptions.supersample]}
                      />
                    </Stage>
                    <Stage target={histogram_max}>
                      <Kernel
                        source={downsampled_histogram}
                        shader={histogramMax}
                        // 64 threads
                        size={[iterationOptions.parallelism]}
                        args={[histogram.size]}
                      />
                    </Stage>
                    <Stage targets={[texture, textureBuf]}>
                      <Kernel
                        sources={[downsampled_histogram, histogram_max]}
                        shader={renderHistogram}
                        args={[
                          postProcessOptions.gamma,
                        ]}
                        size={texture.size}
                      />
                    </Stage>
                  </Suspense>
                );
              }}
            </ComputeLoop>
            {children(texture)}
          </>;
        }}
      />
    </Provide>
  );
};
