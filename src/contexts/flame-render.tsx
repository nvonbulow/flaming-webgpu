import { State } from "@hookstate/core"
import { PrimitiveAtom } from "jotai";
import { createContext } from "react";
import { Flame } from "~/flame";

interface FlameRenderContextType {
  hookstate: State<Flame>;
  flameAtom: PrimitiveAtom<Flame>;
};

export const FlameRenderContext = createContext<FlameRenderContextType>(null!);

