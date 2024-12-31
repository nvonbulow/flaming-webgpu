import { Container, HStack } from "styled-system/jsx";
import { Button } from "../ui/button";
import { NumberInput } from "../ui/number-input";
import { defaultIterationOptions, defaultPostProcessingOptions } from "~/defaults";
import { barnsleyFern, IterationOptions, PostProcessingOptions, sierpinskiTriangle, test1, XForm } from "~/flame";
import { Slider } from "../ui/slider";

export interface RenderControlsProps {
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

export function RenderControls ({
  iterationOptions,
  onIterationOptionsChange,
  postProcessOptions,
  onPostProcessOptionsChange,
  onXformsChange,
  live,
  onToggleLive,
  batchNumber,
}: RenderControlsProps) {
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
        <Button onClick={() => {
          onIterationOptionsChange({
            ...defaultIterationOptions(),
            width: 640,
            height: 480,
          });
          onPostProcessOptionsChange(defaultPostProcessingOptions());
          onXformsChange(test1());
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
