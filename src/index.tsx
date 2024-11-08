import { LiveCanvas } from '@use-gpu/react';
import React from 'react';
import { createRoot } from 'react-dom/client';

import { App as GpuApp } from './GpuApp';

const App = () => {
  return (
    <div>
      <div>
        <h1>Hello, World!</h1>
      </div>
      <div>
        <LiveCanvas>
          {(canvas) => {
            canvas.width = 800;
            canvas.height = 600;
            return <GpuApp canvas={canvas} />;
          }}
        </LiveCanvas>
      </div>
    </div>
  );
}

window.onload = async () => {
  const container = document.getElementById('app');
  const root = createRoot(container); // createRoot(container!) if you use TypeScript
  root.render(<App />);
};
