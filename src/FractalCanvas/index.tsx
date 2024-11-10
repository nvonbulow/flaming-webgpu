import React, { Gather, type LC, type PropsWithChildren, useFiber } from '@use-gpu/live';

import { HTML } from '@use-gpu/react';
import { Canvas, DOMEvents, WebGPU } from '@use-gpu/webgpu';
import { DebugProvider, FontLoader, FlatCamera, CursorProvider, PickingTarget, PanControls, LinearRGB, ComputeBuffer, Compute, Suspense, Stage, Kernel, useShader, useLambdaSource, RawFullScreen, StructData, Readback, Pass, TextureBuffer, Loop, useAnimationFrame } from '@use-gpu/workbench';
import { StorageTarget } from '@use-gpu/core';

import { wgsl } from '@use-gpu/shader/wgsl';

import { UseInspect } from '@use-gpu/inspect';
import { inspectGPU } from '@use-gpu/inspect-gpu';
import '@use-gpu/inspect/theme.css';

import { makeFallback } from './Fallback';

import { main as generatePoints } from './wgsl/generate_points.wgsl';
import { main as histogramMax } from './wgsl/histogram_max.wgsl';
import { main as renderHistogram } from './wgsl/histogram_render.wgsl';
import { RenderOptions, XForm } from './wgsl/types.wgsl';

interface XForm {
  variation_id: number;
  affine: number[]; // length 6
  color: number; // index into palette
  speed: number; // blending amount with current color
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

export const FractalCanvas: LC<FractalCanvasProps> = ({ canvas }) => {
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
          <Loop live>
            <LinearRGB>
              <PickingTarget>
                <DOMEvents element={canvas}>
                  <CursorProvider element={canvas}>
                    <FontLoader fonts={FONTS}>
                      <FractalCanvasInternal />
                    </FontLoader>
                  </CursorProvider>
                </DOMEvents>
              </PickingTarget>
            </LinearRGB>
          </Loop>
        </Canvas>
      </WebGPU>
    </UseInspect>
  );
};

const FractalCanvasInternal: LC = () => {
  const { timestamp } = useAnimationFrame();
  const rand_seed = timestamp;
  const histogram_dim = [800, 600];
  const x_range = [-2.5, 2.5];
  const y_range = [-0.2, 10.0];
  return (
    <>
      <Gather
        children={[
          // xforms
          // <Sierpinski
          //   key="xforms"
          //   // centered on 0,0
          //   points={[[0.0, 1.0], [0.5, -.866], [-0.5, -.866]]}
          // />,
          <BarnsleyFern key="xforms" />,
          // histogram
          <ComputeBuffer
            key="histogram"
            // HistogramBucket type
            format="vec4<u32>"
            resolution={1}
            label="histogram"
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
          />,
          <ComputeBuffer
            key="textureBuf"
            format="vec4<f32>"
          />,
        ]}
        then={([xforms, histogram, histogram_max, texture, textureBuf]: StorageTarget[]) => {
          return <>
            <Compute>
              <Suspense>
                <Stage targets={[histogram]}>
                  <Kernel
                    sources={[xforms]}
                    shader={generatePoints}
                    args={[
                      rand_seed,
                      histogram_dim,
                      x_range,
                      y_range,
                    ]}
                    // number of threads
                    size={[64]}
                  />
                </Stage>
                <Stage target={histogram_max}>
                  <Kernel
                    source={histogram}
                    shader={histogramMax}
                    size={histogram.size}
                  />
                </Stage>
                <Stage targets={[texture, textureBuf]}>
                  <Kernel
                    sources={[histogram, histogram_max]}
                    shader={renderHistogram}
                  />
                  {/*
                  <Readback
                    source={textureBuf}
                    then={(data) => {
                      console.log('histogram', data);
                      return null;
                    }}
                  />
                  */}
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
    </>
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
      speed: 0.5,
      weight: 1/3,
    },
    {
      variation_id: 0,
      affine: [0.5, 0.0, 0.5 * points[1][0],
        0.0, 0.5, 0.5 * points[1][1],
        0.0, 0.0, 1.0],
      color: 0.5,
      speed: 0.5,
      weight: 1/3,
    },
    {
      variation_id: 0,
      affine: [0.5, 0.0, 0.5 * points[2][0],
        0.0, 0.5, 0.5 * points[2][1],
        0.0, 0.0, 1.0],
      color: 1.0,
      speed: 0.5,
      weight: 1/3,
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

const BarnsleyFern: LC = () => {
  // Barnsley Fern
  const data: XForm[] = [
    // The stem
    // <xform weight="0.01" color="0" coefs="0 0 0 0.16 0 0"/>
    {
      variation_id: 0,
      affine: [0.0, 0.0, 0.0,
        0.0, 0.16, 0.0,
        0.0, 0.0, 1.0],
      color: 0,
      speed: 0.5,
      weight: 0.01,
    },
    // Repeating leaves
    // <xform weight="0.85" color="0.33" coefs="0.85 -0.04 0.04 0.85 0 1.6"/>
    {
      variation_id: 1,
      affine: [0.85, 0.04, 0.0,
        -0.04, 0.85, 1.6,
        0.0, 0.0, 1.0],
      color: 0.5,
      speed: 0.2,
      weight: 0.85,
    },
    // Main leaf on the left side
    // <xform weight="0.07" color="0.67" coefs="0.2 0.23 -0.26 0.22 0 1.6"/>
    {
      variation_id: 0,
      affine: [0.2, -0.26, 0.0,
        0.23, 0.22, 1.6,
        0.0, 0.0, 1.0],
      color: 1.0,
      speed: 0.5,
      weight: 0.07,
    },
    // Main leaf on the right side
    // <xform weight="0.07" color="1" coefs="-0.15 0.26 0.28 0.24 0 0.44"/>
    {
      variation_id: 0,
      affine: [-0.15, 0.28, 0.0,
        0.26, 0.24, 0.44,
        0.0, 0.0, 1.0],
      color: 1.0,
      speed: 0.5,
      weight: 0.07,
    },
  ];

  return (
    <StructData
      format="array<T>"
      type={XForm}
      data={data}
    />
  );
}

FractalCanvas.displayName = 'FractalCanvas';
