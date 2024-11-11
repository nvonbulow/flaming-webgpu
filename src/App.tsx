import { LiveCanvas } from '@use-gpu/react';
import React, { useState } from 'react';
import { FractalCanvas } from './FractalCanvas';
import { Container, HStack, Stack } from 'styled-system/jsx';
import { Slider } from './components/ui/slider';
import { IterationOptions, normalizeXForms, PostProcessingOptions, XForm } from './flame';
import { barnsleyFern } from './flame/generators';

const defaultIterationOptions = (): IterationOptions => ({
  width: 800,
  height: 600,
  supersample: 2,
  x_range: [-7, 7],
  y_range: [-0.2, 10.0],
  batch_size: 10000,
  parallelism: 64,
});

const defaultPostProcessingOptions = (): PostProcessingOptions => ({
  gamma: 1.0,
});

const defaultXforms = () => barnsleyFern();

interface RenderControlsProps {
  iterationOptions: IterationOptions;
  postProcessOptions: PostProcessingOptions;
  xforms: XForm[];

  onPostProcessOptionsChange: (options: PostProcessingOptions) => void;
  onIterationOptionsChange: (options: IterationOptions) => void;
  onXformsChange: (xforms: XForm[]) => void;
}

const RenderControls: React.FC<RenderControlsProps> = ({
  iterationOptions,
  onIterationOptionsChange,
  postProcessOptions,
  onPostProcessOptionsChange,
}) => {
  return (
    <Container width="full">
      <HStack>
        <Slider
          min={1.0}
          max={10.0}
          step={0.1}
          value={[postProcessOptions.gamma]}
          onValueChange={({ value: [value] }) => {
            onPostProcessOptionsChange({
              ...postProcessOptions,
              gamma: value,
            });
          }}
        >
          Gamma: {postProcessOptions.gamma}
        </Slider>
      </HStack>
      <HStack>
        <Slider
          min={-10.0}
          max={10.0}
          step={0.1}
          value={iterationOptions.x_range}
          onValueChange={({ value }) => {
            onIterationOptionsChange({
              ...iterationOptions,
              x_range: value,
            });
          }}
        >
          X Range: {iterationOptions.x_range[0]} - {iterationOptions.x_range[1]}
        </Slider>
        <Slider
          min={-10.0}
          max={10.0}
          step={0.1}
          value={iterationOptions.y_range}
          onValueChange={({ value }) => {
            onIterationOptionsChange({
              ...iterationOptions,
              y_range: value,
            });
          }}
        >
          Y Range: {iterationOptions.y_range[0]} - {iterationOptions.y_range[1]}
        </Slider>
      </HStack>
    </Container>
  );
};


export const App = () => {
  const [iterationOptions, setIterationOptions] = useState(defaultIterationOptions());
  const [postProcessOptions, setPostProcessOptions] = useState(defaultPostProcessingOptions());
  const [xforms, setXforms] = useState(defaultXforms());

  return (
    <Container display="flex" py="12" gap="8" justifyContent="center">
      <Stack gap="4">
        <LiveCanvas>
          {(canvas) => {
            canvas.width = iterationOptions.width;
            canvas.height = iterationOptions.height;
            return <FractalCanvas
              canvas={canvas}
              xforms={normalizeXForms(xforms)}
              iterationOptions={iterationOptions}
              postProcessOptions={postProcessOptions}
            />;
          }}
        </LiveCanvas>
        <RenderControls
          iterationOptions={iterationOptions}
          onIterationOptionsChange={setIterationOptions}
          postProcessOptions={postProcessOptions}
          onPostProcessOptionsChange={setPostProcessOptions}
          xforms={xforms}
          onXformsChange={setXforms}
        />
      </Stack>
    </Container>
  );
};
