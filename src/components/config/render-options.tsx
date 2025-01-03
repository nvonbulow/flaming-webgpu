import { Container, HStack } from "styled-system/jsx";
import { Button } from "../ui/button";
import { NumberInput } from "../ui/number-input";
import { defaultIterationOptions } from "~/defaults";
import { barnsleyFern, IterationOptions, sierpinskiTriangle, test1 } from "~/flame";
import { Slider } from "../ui/slider";
import { useFlame, useXForms } from "~/hooks/flame-render";

export interface RenderControlsProps {
  iterationOptions: IterationOptions;
  onIterationOptionsChange: (options: IterationOptions) => void;

  live: boolean;
  onToggleLive: () => void;
  batchNumber: number;
}

export function RenderControls ({
  iterationOptions,
  onIterationOptionsChange,
  live,
  onToggleLive,
  batchNumber,
}: RenderControlsProps) {
  const flame = useFlame();
  const { gamma } = flame.coloring;
  const { xforms } = useXForms();

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
      {/* todo: move these presets to a function */}
      <HStack>
        <Button onClick={() => {
          onIterationOptionsChange({
            ...defaultIterationOptions(),
            camera_x: 0.2,
            camera_y: 5.0,
            camera_zoom: 0.14,
          });
          gamma.set(2.0);
          xforms.set(barnsleyFern());
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
          gamma.set(1.0);
          xforms.set(sierpinskiTriangle([
            // points on an equilateral triangle
            // centered at the origin with a side length of 1
            [0.0, 0.57735],
            [0.5, -0.288675],
            [-0.5, -0.288675],
          ]));
        }}>
          Sierpinski Triangle
        </Button>
        <Button onClick={() => {
          onIterationOptionsChange({
            ...defaultIterationOptions(),
            width: 640,
            height: 480,
          });
          gamma.set(1.0);
          xforms.set(test1());
        }
        }>
          Example
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
          value={[gamma.value]}
          onValueChange={({ value: [value] }) => {
            gamma.set(value);
          }}
        >
          Gamma: {gamma.value}
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
