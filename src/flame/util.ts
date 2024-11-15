import { mat3, vec2, vec3 } from "gl-matrix";
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

export interface GetCameraMatrixArgs {
  // width of the viewport in pixels
  viewportSize: vec2;
  // position of the camera in world space
  camera: vec3;
};

export function getRanges({
  // size of the viewport in pixels
  viewportSize: [width, height],
  // position of the camera in world space
  camera: [x, y, zoom],
}: GetCameraMatrixArgs): [vec2, vec2] {
  const inv_zoom = 1 / zoom;
  const inv_aspect = height / width;

  const range_x = vec2.fromValues(x - inv_zoom, x + inv_zoom);
  const range_y = vec2.fromValues(y - inv_zoom * inv_aspect, y + inv_zoom * inv_aspect);

  return [range_x, range_y];
}

export function getCameraMatrix({
  // size of the viewport in pixels
  viewportSize: [width, height],
  // position of the camera in world space
  camera: [x, y, zoom],
}: GetCameraMatrixArgs): mat3 {
  const [range_x, range_y] = getRanges({ viewportSize: [width, height], camera: [x, y, zoom] });

  const x_factor = (width - 1) / (range_x[1] - range_x[0]);
  const y_factor = (height - 1) / (range_y[0] - range_y[1]);

  const scale_mat = mat3.fromValues(
    x_factor, 0, 0,
    0, y_factor, 0,
    -x_factor * range_x[0], -y_factor * range_y[1], 1,
  );

  return scale_mat;
}

