import React, { Gather, type LC, type PropsWithChildren, useFiber } from '@use-gpu/live';

import { HTML } from '@use-gpu/react';
import { Canvas, DOMEvents, WebGPU } from '@use-gpu/webgpu';
import { DebugProvider, FontLoader, FlatCamera, CursorProvider, PickingTarget, PanControls, LinearRGB, ComputeBuffer, Compute, Suspense, Stage, Kernel, useShader, useLambdaSource, RawFullScreen, StructData, Readback } from '@use-gpu/workbench';
import { StorageTarget } from '@use-gpu/core';

import { wgsl } from '@use-gpu/shader/wgsl';

import { UseInspect } from '@use-gpu/inspect';
import { inspectGPU } from '@use-gpu/inspect-gpu';
import '@use-gpu/inspect/theme.css';

import { makeFallback } from './Fallback';

import { main as generatePoints } from './wgsl/generate_points.wgsl';
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

const debugShader = wgsl`
  @link fn getSample(i: u32) -> vec4<f32> {};
  @link fn getSize() -> vec4<u32> {};
  @optional @link fn getGain() -> f32 { return 1.0; };

  fn main(uv: vec2<f32>) -> vec4<f32> {
    let gain = getGain();
    let size = getSize();
    let iuv = vec2<u32>(uv * vec2<f32>(size.xy));
    let i = iuv.x + iuv.y * size.x;

    let value = getSample(i).x * gain;
    return sqrt(vec4<f32>(value, max(value * .1, max(0.0, -value * .3)), max(0.0, -value), 1.0));
  }
`;


export const FractalCanvas: LC<FractalCanvasProps> = ({ canvas }) => {

  return (
    <LiveApp canvas={canvas}>
      <Gather
        children={[
          // xforms
          <Serpinski key="1" />,
          // histogram
          <ComputeBuffer
            key="2"
            format="u32"
            resolution={1}
          />,
        ]}
        then={([xforms, histogram ]: StorageTarget[]) => {
          return <>
            <Compute>
              <Suspense>
                <Stage target={histogram}>
                  <Kernel
                    initial
                    source={xforms}
                    shader={generatePoints}
                  />
                  <Readback
                    source={histogram}
                    then={(data) => {
                      console.log('histogram', data);
                      return null;
                    }}
                  />
                </Stage>
              </Suspense>
            </Compute>
          </>;
        }}
      />
    </LiveApp>
  );
};

const DebugField = ({ field }: { field: StorageTarget }) => {
  const boundShader = useShader(debugShader, [field, () => field.size, 1]);
  const textureSource = useLambdaSource(boundShader, field);
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

const Serpinski: LC = () => {
  const data: XForm[] = [
    {
      variation_id: 0,
      affine: [0.5, 0.0, 0.0,
        0.5, 0.0, 0.0],
      color: 0,
      weight: 1,
    },
    {
      variation_id: 0,
      affine: [0.5, 0.0, 0.5,
        0.5, 0.0, 0.0],
      color: 0,
      weight: 1,
    },
    {
      variation_id: 0,
      affine: [0.5, 0.0, 0.25,
        0.5, 0.0, 0.5],
      color: 0,
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
