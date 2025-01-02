import { State } from "@hookstate/core"
import { createContext } from "react";
import { XForm } from "~/flame";

type FlameRenderContextType = State<{
  xforms: XForm[];
}>;

export const FlameRenderContext = createContext<FlameRenderContextType>(null!);

