import { useHookstate } from "@hookstate/core";
import { useContext } from "react";
import { FlameRenderContext } from "~/contexts/flame-render";

export function useFlame() {
  const flame = useContext(FlameRenderContext);
  return useHookstate(flame);
}

export function useXForms() {
  const flame = useFlame();
  const xforms = useHookstate(flame.xforms);
  return {
    xforms,
    getXForm: (idx: number) => xforms[idx],
  };
}

