import { State } from "@hookstate/core";
import { makeContext, useContext } from "@use-gpu/live";
import { Flame } from "~/flame";
import { useLiveHookstate } from "~/live/hooks/use-hookstate";

type FlameContextType = State<Flame>;

export const FlameContext = makeContext<FlameContextType>(null);

export function useFlame() {
  const flameState = useContext(FlameContext);
  if (!flameState) {
    throw new Error("useFlame must be used within a FlameProvider");
  }
  return useLiveHookstate(flameState);
}

