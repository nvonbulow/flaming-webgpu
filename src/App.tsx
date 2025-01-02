import { hookstate } from "@hookstate/core";
import { FlameRenderContext } from "~/contexts/flame-render";
import { defaultXforms } from "./defaults";
import { FlameEditor } from "./components/flame-editor";

const flameRenderState = hookstate({
  xforms: defaultXforms(),
});

export function App() {
  return (
    <FlameRenderContext.Provider value={flameRenderState}>
      <FlameEditor />
    </FlameRenderContext.Provider>
  );
}
