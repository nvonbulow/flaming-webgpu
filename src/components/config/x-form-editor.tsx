import { Variation, XForm } from '~/flame';
import { NumberInput } from '~/components/ui/number-input';
import { Button } from '~/components/ui/button';
import { createListCollection, Select } from '~/components/ui/select';
import { ChevronsUpDownIcon } from 'lucide-react';
import { useMemo } from 'react';
import { Flex, HStack, VStack } from 'styled-system/jsx';
import { Slider } from '../ui/slider';
import { mat2d } from 'gl-matrix';
import { none, State, useHookstate } from '@hookstate/core';

interface XFormEditorProps {
  xform: State<XForm>;
}

export const XFormEditor: React.FC<XFormEditorProps> = ({
  xform: xformState,
}) => {
  const xform = useHookstate(xformState);
  const step = 0.01;

  const { weight, color, speed, variation } = xform;
  // const [a, b, c, d, e, f] = xform.affine;
  const a = xform.affine[0];
  const b = xform.affine[1];
  const c = xform.affine[2];
  const d = xform.affine[3];
  const e = xform.affine[4];
  const f = xform.affine[5];

  const variationCollection = useMemo(() => createListCollection({
    items: [
      'linear', 'sinusoidal', 'spherical', 'swirl',
      'horseshoe', 'polar', 'handkerchief', 'heart',
      'disc', 'spiral', 'hyperbolic', 'diamond',
      'ex', 'julia', 'bent', 'waves',
      'fisheye', 'popcorn', 'exponential', 'power',
      'cosine', 'rings', 'fan',
    ].map((variation) => ({
      label: variation,
      value: variation,
    })),
  }), []);

  return (
    <VStack gap="2" minW="300">
      <Slider
        min={0.0}
        max={1.0}
        step={0.01}
        value={[xform.weight.get()]}
        onValueChange={({ value: [value] }) => {
          weight.set(value);
        }}
      >
        Weight: {xform.weight.get()}
      </Slider>
      <Slider
        min={0.0}
        max={1.0}
        step={0.01}
        value={[xform.color.get()]}
        onValueChange={({ value: [value] }) => {
          color.set(value);
        }}
      >
        Color: {xform.color.get()}
      </Slider>
      <Slider
        min={0.0}
        max={1.0}
        step={0.01}
        value={[xform.speed.get()]}
        onValueChange={({ value: [value] }) => {
          speed.set(value);
        }}
      >
        Speed: {xform.speed.get()}
      </Slider>
      <HStack gap="4">
        <NumberInput
          value={a.get().toString()}
          step={step}
          allowMouseWheel
          onValueChange={({ value }) => {
            a.set(Number(value));
          }}
        >
          A
        </NumberInput>
        <NumberInput
          value={b.get().toString()}
          step={step}
          allowMouseWheel
          onValueChange={({ value }) => {
            b.set(Number(value));
          }}
        >
          B
        </NumberInput>
        <NumberInput
          value={c.get().toString()}
          step={step}
          allowMouseWheel
          onValueChange={({ value }) => {
            c.set(Number(value));
          }}
        >
          C
        </NumberInput>
      </HStack>
      <HStack gap="4">
        <NumberInput
          value={d.get().toString()}
          step={step}
          allowMouseWheel
          onValueChange={({ value }) => {
            d.set(Number(value));
          }}
        >
          D
        </NumberInput>
        <NumberInput
          value={e.get().toString()}
          step={step}
          allowMouseWheel
          onValueChange={({ value }) => {
            e.set(Number(value));
          }}
        >
          E
        </NumberInput>
        <NumberInput
          value={f.get().toString()}
          step={step}
          allowMouseWheel
          onValueChange={({ value }) => {
            f.set(Number(value));
          }}
        >
          F
        </NumberInput>
      </HStack>
      <HStack gap="4">
        <Button
          onClick={() => {
            const affine = mat2d.fromValues(a.get(), d.get(), b.get(), e.get(), c.get(), f.get());
            const rotated = mat2d.rotate(mat2d.create(), affine, Math.PI / 4);

            // todo: we may as well change the affine to use mat3 in the first place
            xform.affine.set([
              rotated[0], rotated[2], rotated[4],
              rotated[1], rotated[3], rotated[5],
            ]);
          }}
        >
          Rotate 45 CW
        </Button>
      </HStack>
      <Select.Root
        collection={variationCollection}
        value={[xform.variation.get()]}
        onValueChange={(details) => {
          variation.set(
            details.value[0] as Variation,
          );
        }}
      >
        <Select.Label>
          Variation
        </Select.Label>
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Select a variation" />
            <ChevronsUpDownIcon />
          </Select.Trigger>
        </Select.Control>
        <Select.Positioner>
          <Select.Content maxH={400} overflow="auto">
            <Select.List>
              {[
                'linear', 'sinusoidal', 'spherical', 'swirl',
                'horseshoe', 'polar', 'handkerchief', 'heart',
                'disc', 'spiral', 'hyperbolic', 'diamond',
                'ex', 'julia', 'bent', 'waves',
                'fisheye', 'popcorn', 'exponential', 'power',
                'cosine', 'rings', 'fan',
              ].map((variation) => (
                <Select.Item
                  key={variation}
                  item={{
                    label: variation,
                    value: variation,
                  }}
                >
                  <Select.ItemText>{variation}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Content>
        </Select.Positioner>
      </Select.Root>
      <Flex width="full" direction="row" alignItems="flex-start">
        <Button onClick={() => xform.set(none)}>
          Delete
        </Button>
      </Flex>
    </VStack>
  );
};
