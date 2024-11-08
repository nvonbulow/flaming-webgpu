import React, { type LC, type PropsWithChildren, useFiber } from '@use-gpu/live';

import { HTML } from '@use-gpu/react';
import { Canvas, DOMEvents, WebGPU } from '@use-gpu/webgpu';
import { DebugProvider, FontLoader, FlatCamera, Pass, CursorProvider, PickingTarget, ImageTexture, PanControls, Animate } from '@use-gpu/workbench';
import { UI, Layout, Flex, Inline, Text, Block } from '@use-gpu/layout';

import { UseInspect } from '@use-gpu/inspect';
import { inspectGPU } from '@use-gpu/inspect-gpu';
import '@use-gpu/inspect/theme.css';

import { makeFallback } from './Fallback';

// Can import .wgsl directly as module
import { wgslFunction } from './wgsl/test.wgsl';
import { TextureSource } from '@use-gpu/shader';
import { Line, Plot, Point, Transform } from '@use-gpu/plot';
console.log(wgslFunction);

const FONTS = [
  {
    family: 'Lato',
    weight: 'black',
    style: 'normal',
    src: '/Lato-Black.ttf',
  },
];

interface AppProps {
  canvas: HTMLCanvasElement;
}

export const App: LC<AppProps> = ({ canvas }) => {

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
          <PickingTarget>
            <DOMEvents element={canvas}>
              <CursorProvider element={canvas}>
                <FontLoader fonts={FONTS}>
                  <Camera /* See below */>
                    <Pass /* Render pass */>
                      <Plot>
                        <Transform position={[100, 100]}>
                          <Animate
                            keyframes={[
                              [0,0],
                              [10, 360],
                            ]}
                            prop="rotation"
                            speed={1}
                            ease="linear"
                          >
                            <Transform rotation={30}>
                              <Point position={[0, 0]} color="#ff0000" size={5} />
                              <Point position={[100, 100]} color="#00ff00" size={5} />
                              <Line positions={[[0, 0], [100, 100]]} color="#0000ff" />
                            </Transform>
                          </Animate>
                        </Transform>
                      </Plot>
                      <UI /* 2D Layout */>
                        <Layout /* Flex box */>
                          <Flex width="100%" height="100%" align="center">
                            <Flex width={500} height={150} fill="#3090ff" align="center" direction="y">
                              <Inline align="center">
                                <Text weight="black" size={48} lineHeight={64} color="#ffffff">-~ Use.GPU ~-</Text>
                              </Inline>
                              <Inline align="center">
                                <Text weight="black" size={16} lineHeight={64} color="#ffffff" opacity={0.5}>Zoom Me</Text>
                              </Inline>

                              <ImageTexture
                                url="/test.png"
                                colorSpace="srgb"
                              >{(texture: TextureSource | null) =>
                                <Flex align="center" width="100%" height={150}>
                                  <Block
                                    fill="#3090ff"
                                    width={150}
                                    height={150}
                                    margin={20}
                                    texture={texture}
                                    image={{ fit: 'scale' }}
                                  />
                                </Flex>
                                }</ImageTexture>
                            </Flex>
                          </Flex>

                        </Layout>
                      </UI>
                    </Pass>
                  </Camera>
                </FontLoader>
              </CursorProvider>
            </DOMEvents>
          </PickingTarget>
        </Canvas>
      </WebGPU>

    </UseInspect>
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

App.displayName = 'App';
