import { hookstate } from "@hookstate/core";
import { FlameRenderContext } from "~/contexts/flame-render";
import { defaultXforms } from "./defaults";
import { FlameEditor } from "./components/flame-editor";
import { devtools } from "@hookstate/devtools";
import { Flame } from "~/flame";

import { DevTools } from 'jotai-devtools';
// todo: remove in production
import 'jotai-devtools/styles.css';

import { atom, createStore, Provider } from 'jotai';

const defaultFlame: Flame = {
  xforms: defaultXforms(),
  coloring: {
    gamma: 1.0,
  },
};

const flameRenderState = hookstate(defaultFlame, devtools({ key: 'flame' }));

const flameAtom = atom(defaultFlame);

const store = createStore();

export function App() {
  return (<>
    <Provider store={store}>
      <FlameRenderContext.Provider value={{
        hookstate: flameRenderState,
        flameAtom,
      }}>
        <FlameEditor />
      </FlameRenderContext.Provider>
      <DevTools />
    </Provider>
  </>);
}
