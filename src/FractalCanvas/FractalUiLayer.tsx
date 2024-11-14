import React, { LC } from "@use-gpu/live";
import { Axis, Cartesian, Grid, Line, Plot, Point, Transform } from "@use-gpu/plot";
import { XForm } from "~/flame";

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

export interface FractalUiLayerProps {
  xforms: XForm[];
};
export const FractalUiLayer: LC<FractalUiLayerProps> = ({ xforms }) => {
  return (
    <Plot>
      <Cartesian
        range={[
          [-1, 1],
          [-1, 1],
        ]}
        scale={600}
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

