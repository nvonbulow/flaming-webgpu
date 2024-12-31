import { LiveCanvas } from '@use-gpu/react';
import { useMemo, useState } from 'react';
import { FractalCanvas } from './FractalCanvas';
import { Box, Container, HStack, VStack } from 'styled-system/jsx';
import { Button } from './components/ui/button';
import { Tabs } from './components/ui/tabs';
import { Card } from './components/ui/card';
import { Checkbox } from './components/ui/checkbox';
import { defaultIterationOptions, defaultPostProcessingOptions, defaultXforms } from './defaults';
import { RenderControls } from './components/config/render-options';
import { XFormEditor } from './components/config/x-form-editor';
import { PaletteEditor } from './components/config/palette-editor';

export function App() {
  const [iterationOptions, setIterationOptions] = useState(defaultIterationOptions());
  const [postProcessOptions, setPostProcessOptions] = useState(defaultPostProcessingOptions());
  const [xforms, setXforms] = useState(defaultXforms());

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
        <LiveCanvas>
          {(canvas) => {
            canvas.width = iterationOptions.width;
            canvas.height = iterationOptions.height;
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
