import { XForm } from "./types";

/**
  * Ensures that the sum of the weights of the xforms is 1
  * as required by the compute shader
  */
export function normalizeXForms(xforms: XForm[]): XForm[] {
  const totalWeight = xforms.reduce((acc, xform) => acc + xform.weight, 0);
  return xforms.map(xform => ({
    ...xform,
    weight: xform.weight / totalWeight,
  }));
}

