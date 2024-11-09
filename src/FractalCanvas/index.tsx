import React, { Gather, type LC, type PropsWithChildren, useFiber } from '@use-gpu/live';

import { HTML } from '@use-gpu/react';
import { Canvas, DOMEvents, WebGPU } from '@use-gpu/webgpu';
import { DebugProvider, FontLoader, FlatCamera, CursorProvider, PickingTarget, PanControls, LinearRGB, ComputeBuffer, Compute, Suspense, Stage, Kernel, useShader, useLambdaSource, RawFullScreen, StructData, Readback, Pass, TextureBuffer } from '@use-gpu/workbench';
import { StorageTarget } from '@use-gpu/core';

import { wgsl } from '@use-gpu/shader/wgsl';

import { UseInspect } from '@use-gpu/inspect';
import { inspectGPU } from '@use-gpu/inspect-gpu';
import '@use-gpu/inspect/theme.css';

import { makeFallback } from './Fallback';

import { main as generatePoints } from './wgsl/generate_points.wgsl';
import { main as histogramMax } from './wgsl/histogram_max.wgsl';
import { main as renderHistogram } from './wgsl/histogram_render.wgsl';
import { XForm } from './wgsl/types.wgsl';

// interface Flame {
//   xforms: XForm[];
// }

interface XForm {
  variation_id: number;
  affine: number[]; // length 6
  color: number; // index into palette
  weight: number; // weight of this xform
}

const FONTS = [
  {
    family: 'Lato',
    weight: 'black',
    style: 'normal',
    src: '/Lato-Black.ttf',
  },
];

interface FractalCanvasProps {
  canvas: HTMLCanvasElement;
}

const LiveApp: LC<PropsWithChildren<FractalCanvasProps>> = ({ canvas, children }) => {
  const root = document.querySelector('#use-gpu')!;

  // This is for the UseInspect inspector only
  const fiber = useFiber();

  return (
    <UseInspect fiber={fiber} provider={DebugProvider} extensions={[inspectGPU]}>
      <WebGPU // WebGPU Canvas with a font
        fallback={(error: Error) => <HTML container={root}>{makeFallback(error)}</HTML>}
      >
        <Canvas
          canvas={canvas}
          width={canvas.width}
          height={canvas.height}
        >
          <LinearRGB>
            <PickingTarget>
              <DOMEvents element={canvas}>
                <CursorProvider element={canvas}>
                  <FontLoader fonts={FONTS}>
                    {children}
                  </FontLoader>
                </CursorProvider>
              </DOMEvents>
            </PickingTarget>
          </LinearRGB>
        </Canvas>
      </WebGPU>
    </UseInspect>
  );
};




export const FractalCanvas: LC<FractalCanvasProps> = ({ canvas }) => {

  return (
    <LiveApp canvas={canvas}>
      <Gather
        children={[
          // xforms
          <Sierpinski
            key="1"
            // centered on 0,0
            points={[[0.0, 1.0], [0.5, -.866], [-0.5, -.866]]}
          />,
          // histogram
          <ComputeBuffer
            key="2"
            // HistogramBucket type
            format="vec4<u32>"
            resolution={1}
            label="histogram"
          />,
          <ComputeBuffer
            key="3"
            format="u32"
            label="histogram_max"
            width={1}
            height={1}
            depth={1}
          />,
          <ComputeBuffer
            key="4"
            format="vec3<f32>"
            label="point_history"
            width={500000}
            height={1}
            depth={1}
          />,
          <TextureBuffer
            key="5"
            format="rgba32float"
          />
        ]}
        then={([xforms, histogram, histogram_max, point_history, texture ]: StorageTarget[]) => {
          console.log(texture);
          return <>
            <Compute>
              <Suspense>
                <Stage targets={[histogram, point_history]}>
                  <Kernel
                    initial
                    source={xforms}
                    shader={generatePoints}
                    // number of threads
                    size={[1]}
                  />
                  <Readback
                    source={histogram}
                    then={(data) => {
                      console.log('histogram', data);
                      return null;
                    }}
                  />
                  <Readback
                    source={point_history}
                    then={(data) => {
                      console.log('point history', data);
                      return null;
                    }}
                  />
                </Stage>
                <Stage target={histogram_max}>
                  <Kernel
                    initial
                    source={histogram}
                    shader={histogramMax}
                    size={histogram.size}
                  />
                  <Readback
                    source={histogram_max}
                    then={(data) => {
                      console.log('histogram_max', data);
                      return null;
                    }}
                  />
                </Stage>
                <Stage target={texture}>
                  <Kernel
                    initial
                    sources={[histogram, histogram_max]}
                    shader={renderHistogram}
                  />
                </Stage>
              </Suspense>
            </Compute>
            <FlatCamera>
              <Pass>
                <DebugField texture={texture} />
              </Pass>
            </FlatCamera>
          </>;
        }}
      />
    </LiveApp>
  );
};

const debugShader = wgsl`
  @link var texture: texture_2d<f32>;

  fn main(uv: vec2<f32>) -> vec4<f32> {
    let size = vec2<f32>(textureDimensions(texture));

    let color = textureLoad(texture, vec2<i32>(uv * size), 0);

    return color;
  }
`;

const DebugField = ({ texture }: { texture: StorageTarget }) => {
  const boundShader = useShader(debugShader, [texture]);
  const textureSource = useLambdaSource(boundShader, texture);
  return (
    <RawFullScreen texture={textureSource} />
  );
};

// Wrap this in its own component to avoid JSX trashing of the view
type CameraProps = PropsWithChildren<object>;
const Camera: LC<CameraProps> = (props: CameraProps) => (
  /* 2D pan controls + flat view */
  <PanControls
  >{
      (x, y, zoom) => <FlatCamera x={x} y={y} zoom={zoom}>{props.children}</FlatCamera>
    }</PanControls>
);

const Sierpinski: LC<{ points: number[][] }> = ({ points }) => {
  // serpinski triangle
  const data: XForm[] = [
    {
      variation_id: 0,
      affine: [0.5, 0.0, 0.5 * points[0][0],
        0.0, 0.5, 0.5 * points[0][1],
        0.0, 0.0, 1.0],
      color: 0,
      weight: 1,
    },
    {
      variation_id: 0,
      affine: [0.5, 0.0, 0.5 * points[1][0],
        0.0, 0.5, 0.5 * points[1][1],
        0.0, 0.0, 1.0],
      color: 0.5,
      weight: 1,
    },
    {
      variation_id: 0,
      affine: [0.5, 0.0, 0.5 * points[2][0],
        0.0, 0.5, 0.5 * points[2][1],
        0.0, 0.0, 1.0],
      color: 1.0,
      weight: 1,
    },
  ];

  return (
    <StructData
      format="array<T>"
      type={XForm}
      data={data}
    />
  );
};

FractalCanvas.displayName = 'FractalCanvas';
