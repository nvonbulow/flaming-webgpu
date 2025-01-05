import { useCallback, useMemo } from "react";
import { Container, HStack } from "styled-system/jsx";
import { Button } from "../ui/button";
import { NumberInput } from "../ui/number-input";
import { defaultIterationOptions } from "~/defaults";
import { barnsleyFern, Flame, IterationOptions, sierpinskiTriangle, test1 } from "~/flame";
import { Slider } from "../ui/slider";
import { useXForms } from "~/hooks/flame-render";
import { useContext } from "react";
import { FlameRenderContext } from "~/contexts/flame-render";
import { useAtom, useSetAtom } from "jotai";
import { focusAtom } from 'jotai-optics';
import { OpticFor } from "optics-ts";

export interface RenderControlsProps {
  iterationOptions: IterationOptions;
  onIterationOptionsChange: (options: IterationOptions) => void;

  live: boolean;
  onToggleLive: () => void;
  batchNumber: number;
}

export function RenderControls({
  iterationOptions,
  onIterationOptionsChange,
  live,
  onToggleLive,
  batchNumber,
}: RenderControlsProps) {
  const { flameAtom } = useContext(FlameRenderContext);
  const [gamma, setGamma] = useAtom(
    useMemo(() => focusAtom(flameAtom, o => o.prop('coloring').prop('gamma')), [flameAtom])
  );

  const setXforms = useSetAtom(
    useMemo(() => focusAtom(flameAtom, o => o.prop('xforms')), [flameAtom])
  );

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
          setGamma(2.0);
          setXforms(barnsleyFern());
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
          setGamma(1.0);
          setXforms(sierpinskiTriangle([
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
          setGamma(1.0);
          setXforms(test1());
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
          value={[gamma]}
          onValueChange={({ value: [value] }) => {
            setGamma(value);
          }}
        >
          Gamma: {gamma}
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
