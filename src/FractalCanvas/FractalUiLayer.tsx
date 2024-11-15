import React, { LC, useMemo } from "@use-gpu/live";
import { Axis, Cartesian, Grid, Line, Plot, Point, Transform } from "@use-gpu/plot";
import { mat4, vec2 } from "gl-matrix";
import { getCameraMatrix, IterationOptions, XForm } from "~/flame";

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

  // compute the position of the origin in the camera space
  const origin = useMemo(() => {
    const cameraMat = getCameraMatrix({
      viewportSize: [width, height],
      camera: [camera_x, camera_y, camera_zoom],
    });

    return vec2.transformMat3(vec2.create(), origin, cameraMat);
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

