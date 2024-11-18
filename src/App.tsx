import { LiveCanvas } from '@use-gpu/react';
import React, { useMemo, useState } from 'react';
import { FractalCanvas } from './FractalCanvas';
import { Box, Container, Flex, HStack, VStack } from 'styled-system/jsx';
import { Slider } from './components/ui/slider';
import { getPresetPalette, getPresetPaletteNames, IterationOptions, Palette, PostProcessingOptions, Variation, XForm } from './flame';
import { barnsleyFern, example, sierpinskiTriangle } from './flame/generators';
import { NumberInput } from './components/ui/number-input';
import { Button } from './components/ui/button';
import { Tabs } from './components/ui/tabs';
import { Card } from './components/ui/card';
import { mat2d } from 'gl-matrix';
import { Checkbox } from './components/ui/checkbox';
import { createListCollection, Select } from './components/ui/select';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';

const defaultIterationOptions = (): IterationOptions => ({
  width: 800,
  height: 600,
  supersample: 2,
  palette: getPresetPalette('fire-dragon'),
  camera_x: 0,
  camera_y: 0,
  camera_zoom: 1,
  batch_size: 10000,
  parallelism: 1024,
  batch_limit: 100,
});

const defaultPostProcessingOptions = (): PostProcessingOptions => ({
  gamma: 4.0,
});

const defaultXforms = (): XForm[] => [{
  variation: 'linear',
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
        <Button onClick={() => {
          onIterationOptionsChange({
            ...defaultIterationOptions(),
            width: 800,
            height: 800,
          });
          onPostProcessOptionsChange(defaultPostProcessingOptions());
          onXformsChange(example());
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

type PaletteEditorProps = {
  palette: Palette;
  onPaletteChange: (palette: Palette) => void;
};

const generateLinearGradient = (palette: Float32Array) => {
  // generate a css linear gradient from the palette
  const colors = [];
  for (let i = 0; i < palette.length; i += 3) {
    colors.push(`rgb(${palette[i] * 255}, ${palette[i + 1] * 255}, ${palette[i + 2] * 255})`);
  }

  return `linear-gradient(90deg, ${colors.join(', ')})`;
};

const PaletteEditor: React.FC<PaletteEditorProps> = ({ palette, onPaletteChange }) => {
  const collection = useMemo(() => createListCollection({
    items: [
      ...getPresetPaletteNames().map((name) => ({
        label: name,
        value: name,
        background: generateLinearGradient(getPresetPalette(name).colors),
        // background: 'white',
      })),
    ],
  }), []);

  const contentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: collection.items.length,
    getScrollElement: () => contentRef.current,
    estimateSize: () => 40,
  });

  return (
    <VStack gap="4">
      <Select.Root
        positioning={{ sameWidth: true }}
        collection={collection}
        value={[palette.name]}
        onValueChange={(details) => onPaletteChange(getPresetPalette(details.value[0]))}
      >
        <Select.Label>
          Palette
        </Select.Label>
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Select a palette" />
            <ChevronsUpDownIcon />
          </Select.Trigger>
        </Select.Control>
        <Select.Positioner>
          <Select.Content height="400px" overflow="auto" ref={contentRef}>
            <Select.List
              w="full"
              position="relative"
              style={{
                height: `${virtualizer.getTotalSize()}px`,
              }}
            >
              {virtualizer.getVirtualItems().map((vitem) => {
                const item = collection.items[vitem.index];
                return (
                  <Select.Item
                    key={vitem.key}
                    item={item}
                    position="absolute"
                    top={0} left={0} w="full"
                    style={{
                      height: `${vitem.size}px`,
                      transform: `translateY(${vitem.start}px)`,
                    }}
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    <Flex direction="column" width="full">
                      <Flex direction="row" width="full" justifyContent="space-between">
                        <Select.ItemText>{item.label}</Select.ItemText>
                        <Select.ItemIndicator>
                          <CheckIcon />
                        </Select.ItemIndicator>
                      </Flex>
                      <Box
                        width="full"
                        height="4"
                        style={{
                          background: item.background,
                        }}
                      />
                    </Flex>
                  </Select.Item>
                );
              })}
            </Select.List>
          </Select.Content>
        </Select.Positioner>
      </Select.Root>
    </VStack>
  );
};


export const App = () => {
  const [iterationOptions, setIterationOptions] = useState(defaultIterationOptions());
  const [postProcessOptions, setPostProcessOptions] = useState(defaultPostProcessingOptions());
  const [xforms, setXforms] = useState(defaultXforms());

  const [live, setLive] = useState(true);

  const [batchNumber, setBatchNumber] = useState(0);

  const tabOptions = [
    { id: 'render', label: 'Render' },
    { id: 'xforms', label: 'XForms' },
    { id: 'ui', label: 'UI' },
    { id: 'palette', label: 'Palette' },
  ];

  const [showUi, setShowUi] = useState(true);

  return (
    <Container display="flex" py="12" gap="8" justifyContent="center" height="svh">
      <HStack gap="4">
        <LiveCanvas>
          {(canvas) => {
            canvas.width = iterationOptions.width;
            canvas.height = iterationOptions.height;
            // canvas.width = 800;
            // canvas.height = 600;
            return <FractalCanvas
              canvas={canvas}
              xforms={xforms}
              iterationOptions={iterationOptions}
              postProcessOptions={postProcessOptions}
              live={live}
              onRenderBatch={setBatchNumber}
              showUi={showUi}
            />;
          }}
        </LiveCanvas>
        <Container height="full">
          <Tabs.Root defaultValue="render" height="full">
            <Tabs.List>
              {tabOptions.map((tab) => (
                <Tabs.Trigger key={tab.id} value={tab.id}>
                  {tab.label}
                </Tabs.Trigger>
              ))}
              <Tabs.Indicator />
            </Tabs.List>
            <Box overflowY="scroll" h="full">
              <Tabs.Content value="ui">
                <Checkbox
                  checked={showUi}
                  onChange={() => setShowUi(!showUi)}
                >
                  Show UI
                </Checkbox>
              </Tabs.Content>
              <Tabs.Content value="render">
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
              </Tabs.Content>
              <Tabs.Content value="xforms">
                <Button onClick={() => {
                  setXforms([...xforms, ...defaultXforms()]);
                }}>
                  Add XForm
                </Button>
                <VStack gap="8">
                  {xforms.map((xform, index) => (
                    <Card.Root key={index}>
                      <Card.Header>
                        <Card.Title>
                          XForm {index + 1}
                        </Card.Title>
                      </Card.Header>
                      <Card.Body>
                        <XFormEditor
                          xform={xform}
                          onXformChange={(xform) => {
                            const new_xforms = [...xforms];
                            new_xforms[index] = xform;
                            setXforms(new_xforms);
                          }}
                          onXFormDelete={() => {
                            const new_xforms = [...xforms];
                            new_xforms.splice(index, 1);
                            setXforms(new_xforms);
                          }}
                        />
                      </Card.Body>
                    </Card.Root>
                  ))}
                </VStack>
              </Tabs.Content>
              <Tabs.Content value="palette">
                <PaletteEditor
                  palette={iterationOptions.palette}
                  onPaletteChange={(palette) => {
                    setIterationOptions({
                      ...iterationOptions,
                      palette,
                    });
                  }}
                />
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </Container>
      </HStack>
    </Container>
  );
};
