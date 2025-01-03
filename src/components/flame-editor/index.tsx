import { LiveCanvas } from '@use-gpu/react';
import { useMemo, useState } from 'react';
import { FractalCanvas as LiveFractalCanvas } from '~/FractalCanvas';
import { Box, Container, HStack, VStack } from 'styled-system/jsx';
import { Button } from '~/components/ui/button';
import { Tabs } from '~/components/ui/tabs';
import { Card } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { defaultIterationOptions, defaultPostProcessingOptions, defaultXforms } from '~/defaults';
import { RenderControls } from '~/components/config/render-options';
import { XFormEditor } from '~/components/config/x-form-editor';
import { PaletteEditor } from '~/components/config/palette-editor';
import { useXForms } from '~/hooks/flame-render';
import { IterationOptions, PostProcessingOptions } from '~/flame';

interface LiveFractalCanvasProps {
  iterationOptions: IterationOptions;
  postProcessOptions: PostProcessingOptions;
  live: boolean;
  showUi: boolean;
  setBatchNumber: (batchNumber: number) => void;
}

function FractalCanvas({
  iterationOptions,
  postProcessOptions,
  live,
  showUi,
  setBatchNumber,
}: LiveFractalCanvasProps) {
  const { xforms: xformsState } = useXForms();
  // need to memoize xforms to avoid re-rendering the canvas
  // todo: figure out how to use hookstate with use-gpu
  const xforms = useMemo(() => xformsState.get(), [xformsState]);

  return (
    <LiveCanvas>
      {(canvas) => {
        canvas.width = iterationOptions.width;
        canvas.height = iterationOptions.height;
        return <LiveFractalCanvas
          canvas={canvas}
          // todo: fix types
          xforms={xforms}
          iterationOptions={iterationOptions}
          postProcessOptions={postProcessOptions}
          live={live}
          onRenderBatch={setBatchNumber}
          showUi={showUi}
        />;
      }}
    </LiveCanvas>
  );
}

export function FlameEditor() {
  const [iterationOptions, setIterationOptions] = useState(defaultIterationOptions());
  const [postProcessOptions, setPostProcessOptions] = useState(defaultPostProcessingOptions());

  const { xforms } = useXForms();

  const [live, setLive] = useState(true);

  const [batchNumber, setBatchNumber] = useState(0);

  const tabOptions = useMemo(() => [
    { id: 'render', label: 'Render' },
    { id: 'xforms', label: 'XForms' },
    { id: 'ui', label: 'UI' },
    { id: 'palette', label: 'Palette' },
  ], []);

  const [showUi, setShowUi] = useState(true);

  return (
    <Container display="flex" py="12" gap="8" justifyContent="center" height="svh">
      <HStack gap="4">
        <FractalCanvas
          iterationOptions={iterationOptions}
          postProcessOptions={postProcessOptions}
          live={live}
          showUi={showUi}
          setBatchNumber={setBatchNumber}
        />
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
                  live={live}
                  onToggleLive={() => setLive(!live)}
                  batchNumber={batchNumber}
                />
              </Tabs.Content>
              <Tabs.Content value="xforms">
                <Button onClick={() => {
                  xforms.merge(defaultXforms()[0]);
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
                        <XFormEditor xform={xform} />
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
