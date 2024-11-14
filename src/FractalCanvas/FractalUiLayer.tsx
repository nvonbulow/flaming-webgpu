import React, { LC, useMemo } from "@use-gpu/live";
import { Axis, Cartesian, Grid, Line, Plot, Point, Transform } from "@use-gpu/plot";
import { mat3, mat4, vec2 } from "gl-matrix";
import { IterationOptions, XForm } from "~/flame";

const TRIANGLE_COLORS = [
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#00ffff",
  "#ff00ff",
];

export interface XFormUiTriangleProps {
  xform: XForm;
  color: string;
};
export const XFormUiTriangle: LC<XFormUiTriangleProps> = ({
  xform,
  color = TRIANGLE_COLORS[0],
}) => {
  const [
    a, b, c,
    d, e, f,
  ] = xform.affine;
  const pointSize = 10;
  return (
    <Transform
      position={[c, f]}
    >
      <Point
        positions={[
          [0, 0],
          [a, b],
          [d, e],
        ]}
        size={pointSize}
        color={color}
      />
      <Line
        positions={[
          [0, 0],
          [a, b],
          [d, e],
        ]}
        color={color}
        loop
      />
    </Transform>
  );
};

const FLIP_Y = mat4.fromScaling(mat4.create(), [1, -1, 1]);

export interface FractalUiLayerProps {
  xforms: XForm[];
  iterationOptions: IterationOptions;
};
export const FractalUiLayer: LC<FractalUiLayerProps> = ({
  xforms,
  iterationOptions,
}) => {
  const {
    camera_x,
    camera_y,
    camera_zoom,
    width,
    height,
  } = iterationOptions;

  const [range_x, range_y] = useMemo(() => {
    const inv_zoom = 1 / camera_zoom;
    const inv_aspect = height / width;

    const range_x = vec2.fromValues(camera_x - inv_zoom, camera_x + inv_zoom);
    const range_y = vec2.fromValues(camera_y - inv_zoom * inv_aspect, camera_y + inv_zoom * inv_aspect);

    return [range_x, range_y];
  }, [camera_x, camera_y, camera_zoom, width, height]);

  // compute the position of the origin in the camera space
  const origin = useMemo(() => {
    // debugger;
    const inv_zoom = 1 / camera_zoom;
    const inv_aspect = height / width;

    const range_x = vec2.fromValues(camera_x - inv_zoom, camera_x + inv_zoom);
    const range_y = vec2.fromValues(camera_y - inv_zoom * inv_aspect, camera_y + inv_zoom * inv_aspect);

    console.log('ranges', range_x, range_y);

    const x_factor = (width - 1) / (range_x[1] - range_x[0]);
    const y_factor = (height - 1) / (range_y[0] - range_y[1]);

    const scale_mat = mat3.fromValues(
      x_factor, 0, 0,
      0, y_factor, 0,
      -x_factor * range_x[0], -y_factor * range_y[1], 1,
    );

    const origin = vec2.create();
    vec2.transformMat3(origin, origin, scale_mat);

    return origin;
  }, [ camera_x, camera_y, camera_zoom, width, height ]);


  return (
    <Plot>
      <Cartesian
        range={[
          [-1, 1],
          [-1, 1],
        ]}
        scale={[width * camera_zoom / 2]}
        position={origin}
        // flip y axis so positive y is up
        matrix={FLIP_Y}
        axes="xy"
      >
        <Grid axes="xy" opacity={0.1} />
        <Axis axis="x" range={[-1, 1]} />
        <Axis axis="y" range={[-1, 1]} />
        {xforms.map((xform, i) => (
          <XFormUiTriangle
            key={i}
            xform={xform}
            color={TRIANGLE_COLORS[i % TRIANGLE_COLORS.length]}
          />
        ))}
      </Cartesian>
    </Plot>
  );
};

