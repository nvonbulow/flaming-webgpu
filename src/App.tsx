import { LiveCanvas } from '@use-gpu/react';
import React from 'react';
import { FractalCanvas } from './FractalCanvas';

export const App = () => {
  return (
    <div>
      <div>
        <h1>Hello, World!</h1>
      </div>
      <div>
        <LiveCanvas>
          {(canvas) => {
            canvas.width = 1200;
            canvas.height = 800;
            return <FractalCanvas canvas={canvas} />;
          }}
        </LiveCanvas>
      </div>
    </div>
  );
};
