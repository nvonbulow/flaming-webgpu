import { hookstate } from "@hookstate/core";
import { FlameRenderContext } from "~/contexts/flame-render";
import { defaultXforms } from "./defaults";
import { FlameEditor } from "./components/flame-editor";
import { devtools } from "@hookstate/devtools";
import { Flame } from "~/flame";

const flameRenderState = hookstate<Flame>({
  xforms: defaultXforms(),
}, devtools({ key: 'flame' }));

export function App() {
  return (
    <FlameRenderContext.Provider value={flameRenderState}>
      <FlameEditor />
    </FlameRenderContext.Provider>
  );
}
