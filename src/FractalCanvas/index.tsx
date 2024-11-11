import React, { type LC, type PropsWithChildren, useFiber } from '@use-gpu/live';

import { HTML } from '@use-gpu/react';
import { Canvas, DOMEvents, WebGPU } from '@use-gpu/webgpu';
import { DebugProvider, FontLoader, FlatCamera, CursorProvider, PickingTarget, PanControls, LinearRGB, useShader, useLambdaSource, RawFullScreen, StructData, Pass } from '@use-gpu/workbench';
import { StorageTarget } from '@use-gpu/core';

import { wgsl } from '@use-gpu/shader/wgsl';

import { UseInspect } from '@use-gpu/inspect';
import { inspectGPU } from '@use-gpu/inspect-gpu';
import '@use-gpu/inspect/theme.css';

import { makeFallback } from './Fallback';

import { XForm as GpuXForm } from './wgsl/types.wgsl';
import { IterationOptions, PostProcessingOptions, type XForm } from '~/flame';
import { FractalRendererPipeline } from './FractalRendererPipeline';

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
  xforms: XForm[];
  iterationOptions: IterationOptions;
  postProcessOptions: PostProcessingOptions;
}

export const FractalCanvas: LC<FractalCanvasProps> = ({ canvas, ...props }) => {
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
                    <FractalRendererPipeline {...props}>
                      {(texture: StorageTarget) => (
                        <FlatCamera>
                          <Pass>
                            <DebugField texture={texture} />
                          </Pass>
                        </FlatCamera>
                      )}
                    </FractalRendererPipeline>
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
FractalCanvas.displayName = 'FractalCanvas';

export interface FractalCanvasInternalProps {
  xforms: XForm[];
  iterationOptions: IterationOptions;
  postProcessOptions: PostProcessingOptions;
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

