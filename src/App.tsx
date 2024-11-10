import { LiveCanvas } from '@use-gpu/react';
import React from 'react';
import { FractalCanvas } from './FractalCanvas';
import { Container,  HStack } from 'styled-system/jsx';
import { Button } from './components/ui/button';
import { IterationOptions, PostProcessingOptions } from './flame';
import { barnsleyFern } from './flame/generators';

const RenderControls = () => {
  return (
    <Container>
      <HStack>
        <Button>Reset</Button>
      </HStack>
    </Container>
  );
};

const iterationOptions: IterationOptions = {
  width: 800,
  height: 600,
  supersample: 1,
  x_range: [-7, 7],
  y_range: [-0.2, 10.0],
  batch_size: 10000,
  parallelism: 64,
};

const postProcessOptions: PostProcessingOptions = {
  gamma: 4.0,
};

const xforms = barnsleyFern();

export const App = () => {
  return (
    <Container>
      <h1>Hello, World!</h1>
      <LiveCanvas>
        {(canvas) => {
          canvas.width = iterationOptions.width;
          canvas.height = iterationOptions.height;
          return <FractalCanvas
            canvas={canvas}
            xforms={xforms}
            iterationOptions={iterationOptions}
            postProcessOptions={postProcessOptions}
          />;
        }}
      </LiveCanvas>
      <RenderControls />
    </Container>
  );
};
