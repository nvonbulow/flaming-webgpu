import { type LC, type PropsWithChildren, Provide, useFiber } from '@use-gpu/live';

import { HTML } from '@use-gpu/react';
import { Canvas, DOMEvents, WebGPU } from '@use-gpu/webgpu';
import { DebugProvider, FontLoader, FlatCamera, CursorProvider, PickingTarget, LinearRGB, useShader, useLambdaSource, RawFullScreen, Pass, Loop } from '@use-gpu/workbench';
import { StorageTarget } from '@use-gpu/core';

import { wgsl } from '@use-gpu/shader/wgsl';

import { UseInspect } from '@use-gpu/inspect';
import { inspectGPU } from '@use-gpu/inspect-gpu';
import '@use-gpu/inspect/theme.css';

import { makeFallback } from './Fallback';

import { Flame, IterationOptions, type XForm } from '~/flame';
import { FractalRendererPipeline } from './FractalRendererPipeline';
import { FractalUiLayer } from './FractalUiLayer';
import { State } from '@hookstate/core';
import { FlameContext } from './fractal-provider';

const FONTS = [
  {
    family: 'Lato',
    weight: 'black',
    style: 'normal',
    src: '/Lato-Black.ttf',
  },
];

interface CanvasSkeletonProps {
  canvas: HTMLCanvasElement;
}
export const CanvasSkeleton: LC<PropsWithChildren<CanvasSkeletonProps>> = ({
  canvas,
  children,
}) => {
  return (
    <Canvas
      canvas={canvas}
      width={canvas.width}
      height={canvas.height}
      backgroundColor={[0, 0, 0, 1]}
    >
      <PickingTarget>
        <DOMEvents element={canvas}>
          <CursorProvider element={canvas}>
            <FontLoader fonts={FONTS}>
              {children}
            </FontLoader>
          </CursorProvider>
        </DOMEvents>
      </PickingTarget>
    </Canvas>
  );
};

interface FractalCanvasProps {
  canvas: HTMLCanvasElement;
  xforms: XForm[];
  flame: State<Flame>;
  iterationOptions: IterationOptions;
  live?: boolean;
  onRenderBatch?: (count: number) => void;
  showUi?: boolean;
}

export const FractalCanvas: LC<FractalCanvasProps> = ({
  canvas,
  flame,
  showUi = false,
  ...props
}) => {
  const root = document.querySelector('#use-gpu')!;

  // This is for the UseInspect inspector only
  const fiber = useFiber();

  return (
    <Provide context={FlameContext} value={flame}>
      <UseInspect fiber={fiber} provider={DebugProvider} extensions={[inspectGPU]}>
        <WebGPU // WebGPU Canvas with a font
          fallback={(error: Error) => <HTML container={root}>{makeFallback(error)}</HTML>}
        >
          <FractalRendererPipeline {...props}>
            {(texture: StorageTarget) => (
              <CanvasSkeleton canvas={canvas} >
                <Loop live>
                  <LinearRGB>
                    <Pass>
                      <VisualizeFullScreen texture={texture} />
                    </Pass>
                    <FlatCamera>
                      {showUi && (
                        <Pass overlay>
                          <FractalUiLayer
                            xforms={props.xforms}
                            iterationOptions={props.iterationOptions}
                          />
                        </Pass>
                      )}
                    </FlatCamera>
                  </LinearRGB>
                </Loop>
              </CanvasSkeleton>
            )}
          </FractalRendererPipeline>
        </WebGPU>
      </UseInspect>
    </Provide>
  );
};
FractalCanvas.displayName = 'FractalCanvas';

const debugShader = wgsl`
  @link var texture: texture_2d<f32>;

  fn main(uv: vec2<f32>) -> vec4<f32> {
    let size = vec2<f32>(textureDimensions(texture));
    let color = textureLoad(texture, vec2<i32>(uv * size), 0);
    return color;
  }
`;

const VisualizeFullScreen = ({ texture }: { texture: StorageTarget }) => {
  const boundShader = useShader(debugShader, [texture]);
  const textureSource = useLambdaSource(boundShader, texture);
  return (
    <RawFullScreen
      texture={textureSource}
      blend="alpha"
    />
  );
};

