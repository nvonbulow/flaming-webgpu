import { LiveCanvas } from '@use-gpu/react';
import React, { useMemo, useState } from 'react';
import { FractalCanvas } from './FractalCanvas';
import { Container, HStack, VStack } from 'styled-system/jsx';
import { Slider } from './components/ui/slider';
import { IterationOptions, normalizeXForms, PostProcessingOptions, XForm } from './flame';
import { barnsleyFern, sierpinskiTriangle } from './flame/generators';
import { NumberInput } from './components/ui/number-input';
import { Button } from './components/ui/button';

const defaultIterationOptions = (): IterationOptions => ({
  width: 800,
  height: 600,
  supersample: 2,
  camera_x: 0,
  camera_y: 0,
  camera_zoom: 1,
  batch_size: 10000,
  parallelism: 64,
  batch_limit: 100,
});

const defaultPostProcessingOptions = (): PostProcessingOptions => ({
  gamma: 4.0,
});

const defaultXforms = (): XForm[] => [{
  variation_id: 0,
  weight: 1.0,
  color: 0.0,
  speed: 0.0,
  affine: [1, 0, 0, 0, 1, 0, 0, 0, 1],
}];

interface RenderControlsProps {
  iterationOptions: IterationOptions;
  postProcessOptions: PostProcessingOptions;
  xforms: XForm[];

  onPostProcessOptionsChange: (options: PostProcessingOptions) => void;
  onIterationOptionsChange: (options: IterationOptions) => void;
  onXformsChange: (xforms: XForm[]) => void;

  live: boolean;
  onToggleLive: () => void;
  batchNumber: number;
}

const RenderControls: React.FC<RenderControlsProps> = ({
  iterationOptions,
  onIterationOptionsChange,
  postProcessOptions,
  onPostProcessOptionsChange,
  xforms,
  onXformsChange,
  live,
  onToggleLive,
  batchNumber,
}) => {
  return (
    <Container spaceY={4}>
      <HStack>
        <Button onClick={onToggleLive}>
          {live ? 'Pause' : 'Resume'}
        </Button>
        <NumberInput
          value={iterationOptions.batch_limit.toString()}
          step={5}
          onValueChange={({ value }) => {
            onIterationOptionsChange({
              ...iterationOptions,
              batch_limit: Number(value),
            });
          }}
        >
          Batch Limit
        </NumberInput>
        <span>Batch: {batchNumber}</span>
      </HStack>
      <HStack>
        <Button onClick={() => {
          onIterationOptionsChange({
            ...defaultIterationOptions(),
            camera_x: 0.2,
            camera_y: 5.0,
            camera_zoom: 0.14,
          });
          onPostProcessOptionsChange(defaultPostProcessingOptions());
          onXformsChange(barnsleyFern());
        }}>
          Barnsley Fern
        </Button>
        <Button onClick={() => {
          onIterationOptionsChange({
            ...defaultIterationOptions(),
            camera_x: 0.0,
            camera_y: 0.125,
            camera_zoom: 2,
            width: 800,
            height: 800,
          });
          onPostProcessOptionsChange(defaultPostProcessingOptions());
          onXformsChange(sierpinskiTriangle([
            // points on an equilateral triangle
            // centered at the origin with a side length of 1
            [0.0, 0.57735],
            [0.5, -0.288675],
            [-0.5, -0.288675],
          ]));
        }}>
          Sierpinski Triangle
        </Button>
      </HStack>
      <HStack>
        <NumberInput
          value={iterationOptions.width.toString()}
          step={1}
          allowMouseWheel
          onValueChange={({ value }) => {
            onIterationOptionsChange({
              ...iterationOptions,
              width: Number(value),
            });
          }}
        >
          Width
        </NumberInput>
        <NumberInput
          value={iterationOptions.height.toString()}
          step={1}
          allowMouseWheel
          onValueChange={({ value }) => {
            onIterationOptionsChange({
              ...iterationOptions,
              height: Number(value),
            });
          }}
        >
          Height
        </NumberInput>
        <NumberInput
          value={iterationOptions.supersample.toString()}
          step={1}
          min={1}
          max={4}
          onValueChange={({ value }) => {
            onIterationOptionsChange({
              ...iterationOptions,
              supersample: Number(value),
            });
          }}
        >
          Supersample
        </NumberInput>
      </HStack>
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
        <NumberInput
          value={iterationOptions.camera_x.toString()}
          step={0.1}
          allowMouseWheel
          onValueChange={({ value }) => {
            onIterationOptionsChange({
              ...iterationOptions,
              camera_x: Number(value),
            });
          }}
        >
          Camera Center X
        </NumberInput>
        <NumberInput
          value={iterationOptions.camera_y.toString()}
          step={0.1}
          allowMouseWheel
          onValueChange={({ value }) => {
            onIterationOptionsChange({
              ...iterationOptions,
              camera_y: Number(value),
            });
          }}
        >
          Camera Center Y
        </NumberInput>
      </HStack>
      <Slider
        min={0.01}
        max={10.0}
        step={0.01}
        value={[iterationOptions.camera_zoom]}
        onValueChange={({ value: [value] }) => {
          onIterationOptionsChange({
            ...iterationOptions,
            camera_zoom: value,
          });
        }}
      >
        Camera Zoom: {iterationOptions.camera_zoom}
      </Slider>
    </Container>
  );
};

interface XFormEditorProps {
  xform: XForm;
  onXformChange: (xform: XForm) => void;
}

export const XFormEditor: React.FC<XFormEditorProps> = ({
  xform,
  onXformChange,
}) => {
  const [a, b, c, d, e, f] = xform.affine;
  const step = 0.01;
  return (
    <Container>
      <VStack gap="0">
        <Slider
          min={0.0}
          max={1.0}
          step={0.01}
          value={[xform.weight]}
          onValueChange={({ value: [value] }) => {
            onXformChange({
              ...xform,
              weight: value,
            });
          }}
        >
          Weight: {xform.weight}
        </Slider>
        <Slider
          min={0.0}
          max={1.0}
          step={0.01}
          value={[xform.color]}
          onValueChange={({ value: [value] }) => {
            onXformChange({
              ...xform,
              color: value,
            });
          }}
        >
          Color: {xform.color}
        </Slider>
        <Slider
          min={0.0}
          max={1.0}
          step={0.01}
          value={[xform.speed]}
          onValueChange={({ value: [value] }) => {
            onXformChange({
              ...xform,
              speed: value,
            });
          }}
        >
          Speed: {xform.speed}
        </Slider>
        <HStack gap="4">
          <NumberInput
            value={a.toString()}
            step={step}
            allowMouseWheel
            onValueChange={({ value }) => {
              onXformChange({
                ...xform,
                affine: [Number(value), b, c, d, e, f, 0, 0, 1],
              });
            }}
          >
            A
          </NumberInput>
          <NumberInput
            value={b.toString()}
            step={step}
            allowMouseWheel
            onValueChange={({ value }) => {
              onXformChange({
                ...xform,
                affine: [a, Number(value), c, d, e, f, 0, 0, 1],
              });
            }}
          >
            B
          </NumberInput>
          <NumberInput
            value={c.toString()}
            step={step}
            allowMouseWheel
            onValueChange={({ value }) => {
              onXformChange({
                ...xform,
                affine: [a, b, Number(value), d, e, f, 0, 0, 1],
              });
            }}
          >
            C
          </NumberInput>
        </HStack>
        <HStack gap="4">
          <NumberInput
            value={d.toString()}
            step={step}
            allowMouseWheel
            onValueChange={({ value }) => {
              onXformChange({
                ...xform,
                affine: [a, b, c, Number(value), e, f, 0, 0, 1],
              });
            }}
          >
            D
          </NumberInput>
          <NumberInput
            value={e.toString()}
            step={step}
            allowMouseWheel
            onValueChange={({ value }) => {
              onXformChange({
                ...xform,
                affine: [a, b, c, d, Number(value), f, 0, 0, 1],
              });
            }}
          >
            E
          </NumberInput>
          <NumberInput
            value={f.toString()}
            step={step}
            allowMouseWheel
            onValueChange={({ value }) => {
              onXformChange({
                ...xform,
                affine: [a, b, c, d, e, Number(value), 0, 0, 1],
              });
            }}
          >
            F
          </NumberInput>
        </HStack>

      </VStack>
    </Container>
  );
};


export const App = () => {
  const [iterationOptions, setIterationOptions] = useState(defaultIterationOptions());
  const [postProcessOptions, setPostProcessOptions] = useState(defaultPostProcessingOptions());
  const [xforms, setXforms] = useState(defaultXforms());
  const normalizedXforms = useMemo(() => normalizeXForms(xforms), [xforms]);

  const [live, setLive] = useState(true);

  const [batchNumber, setBatchNumber] = useState(0);

  return (
    <Container display="flex" py="12" gap="8" justifyContent="center">
      <HStack gap="4">
        <LiveCanvas>
          {(canvas) => {
            canvas.width = iterationOptions.width;
            canvas.height = iterationOptions.height;
            return <FractalCanvas
              canvas={canvas}
              xforms={normalizedXforms}
              iterationOptions={iterationOptions}
              postProcessOptions={postProcessOptions}
              live={live}
              onRenderBatch={setBatchNumber}
            />;
          }}
        </LiveCanvas>
        <VStack gap="4">
          <RenderControls
            iterationOptions={iterationOptions}
            onIterationOptionsChange={setIterationOptions}
            postProcessOptions={postProcessOptions}
            onPostProcessOptionsChange={setPostProcessOptions}
            xforms={xforms}
            onXformsChange={setXforms}
            live={live}
            onToggleLive={() => setLive(!live)}
            batchNumber={batchNumber}
          />
          {xforms.map((xform, index) => (
            <XFormEditor key={index} xform={xform} onXformChange={(xform) => {
              const new_xforms = [...xforms];
              new_xforms[index] = xform;
              setXforms(new_xforms);
            }} />
          ))}
        </VStack>
      </HStack>
    </Container>
  );
};
