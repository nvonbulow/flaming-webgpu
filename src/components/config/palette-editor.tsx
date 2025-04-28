import { getPresetPalette, getPresetPaletteNames, Palette } from "~/flame";
import { createListCollection, Select } from "../ui/select";
import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Box, Flex, VStack } from "styled-system/jsx";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

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

export function PaletteEditor({ palette, onPaletteChange }: PaletteEditorProps) {
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

  const contentRef = useRef<HTMLDivElement>(null);

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
