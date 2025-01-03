import { State } from "@hookstate/core"
import { createContext } from "react";
import { Flame } from "~/flame";

type FlameRenderContextType = State<Flame>;

export const FlameRenderContext = createContext<FlameRenderContextType>(null!);

