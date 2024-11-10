import { LiveCanvas } from '@use-gpu/react';
import React from 'react';
import { FractalCanvas } from './FractalCanvas';
import { Container,  HStack } from 'styled-system/jsx';
import { Button } from './components/ui/button';

const RenderControls = () => {
  return (
    <Container>
      <HStack>
        <Button>Reset</Button>
      </HStack>
    </Container>
  );
};

export const App = () => {
  return (
    <Container>
      <h1>Hello, World!</h1>
      <LiveCanvas>
        {(canvas) => {
          canvas.width = 800;
          canvas.height = 600;
          return <FractalCanvas canvas={canvas} />;
        }}
      </LiveCanvas>
      <RenderControls />
    </Container>
  );
};
