import { Variation, XForm } from '~/flame';
import { NumberInput } from '~/components/ui/number-input';
import { Button } from '~/components/ui/button';
import { createListCollection, Select } from '~/components/ui/select';
import { ChevronsUpDownIcon } from 'lucide-react';
import { useMemo } from 'react';
import { Flex, HStack, VStack } from 'styled-system/jsx';
import { Slider } from '../ui/slider';
import { mat2d } from 'gl-matrix';

interface XFormEditorProps {
  xform: XForm;
  onXformChange: (xform: XForm) => void;
  onXFormDelete: () => void;
}

export const XFormEditor: React.FC<XFormEditorProps> = ({
  xform,
  onXformChange,
  onXFormDelete,
}) => {
  const [a, b, c, d, e, f] = xform.affine;
  const step = 0.01;

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
              affine: [Number(value), b, c, d, e, f],
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
              affine: [a, Number(value), c, d, e, f],
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
              affine: [a, b, Number(value), d, e, f],
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
              affine: [a, b, c, Number(value), e, f],
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
              affine: [a, b, c, d, Number(value), f],
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
              affine: [a, b, c, d, e, Number(value)],
            });
          }}
        >
          F
        </NumberInput>
      </HStack>
      <HStack gap="4">
        <Button
          onClick={() => {
            const affine = mat2d.fromValues(a, d, b, e, c, f);
            const rotated = mat2d.rotate(mat2d.create(), affine, Math.PI / 4);

            // todo: we may as well change the affine to use mat3 in the first place
            onXformChange({
              ...xform,
              affine: [
                rotated[0], rotated[2], rotated[4],
                rotated[1], rotated[3], rotated[5],
              ],
            });
          }}
        >
          Rotate 45 CW
        </Button>
      </HStack>
      <Select.Root
        collection={variationCollection}
        value={[xform.variation]}
        onValueChange={(details) => {
          onXformChange({
            ...xform,
            variation: details.value[0] as Variation,
          });
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
        <Button onClick={onXFormDelete}>
          Delete
        </Button>
      </Flex>
    </VStack>
  );
};
