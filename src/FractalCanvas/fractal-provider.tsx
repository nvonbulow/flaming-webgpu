import { State } from "@hookstate/core";
import { makeContext, useContext } from "@use-gpu/live";
import { Atom } from "jotai";
import { Flame } from "~/flame";
import { useLiveHookstate } from "~/live/hooks/use-hookstate";
import { useAtomValue } from "~/live/jotai";

type FlameContextType = {
  hookstate: State<Flame>;
  flameAtom: Atom<Flame>;
};

export const FlameContext = makeContext<FlameContextType>(null);

export function useFlame() {
  const ctx = useContext(FlameContext);
  if (!ctx) {
    throw new Error("useFlame must be used within a FlameProvider");
  }
  return useLiveHookstate(ctx.hookstate);
}

export function useFlameAtomValue() {
  const { flameAtom } = useContext(FlameContext)!;

  return useAtomValue(flameAtom);
}

