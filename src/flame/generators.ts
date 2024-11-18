import { XForm } from "./types";

export function sierpinskiTriangle(points: number[][]): XForm[] {
  return [
    {
      variation: 'linear',
      affine: [0.5, 0.0, 0.5 * points[0][0],
        0.0, 0.5, 0.5 * points[0][1]],
      color: 0,
      speed: 0.5,
      weight: 1 / 3,
    },
    {
      variation: 'linear',
      affine: [0.5, 0.0, 0.5 * points[1][0],
        0.0, 0.5, 0.5 * points[1][1]],
      color: 0.5,
      speed: 0.5,
      weight: 1 / 3,
    },
    {
      variation: 'linear',
      affine: [0.5, 0.0, 0.5 * points[2][0],
        0.0, 0.5, 0.5 * points[2][1]],
      color: 1.0,
      speed: 0.5,
      weight: 1 / 3,
    },
  ];
}

export function barnsleyFern(): XForm[] {
  return [
    // The stem
    // <xform weight="0.01" color="0" coefs="0 0 0 0.16 0 0"/>
    {
      variation: 'linear',
      affine: [0.0, 0.0, 0.0,
        0.0, 0.16, 0.0],
      color: 0,
      speed: 0.5,
      weight: 0.01,
    },
    // Repeating leaves
    // <xform weight="0.85" color="0.33" coefs="0.85 -0.04 0.04 0.85 0 1.6"/>
    {
      variation: 'linear',
      affine: [0.85, 0.04, 0.0,
        -0.04, 0.85, 1.6],
      color: 0.5,
      speed: 0.2,
      weight: 0.85,
    },
    // Main leaf on the left side
    // <xform weight="0.07" color="0.67" coefs="0.2 0.23 -0.26 0.22 0 1.6"/>
    {
      variation: 'linear',
      affine: [0.2, -0.26, 0.0,
        0.23, 0.22, 1.6],
      color: 1.0,
      speed: 0.5,
      weight: 0.07,
    },
    // Main leaf on the right side
    // <xform weight="0.07" color="1" coefs="-0.15 0.26 0.28 0.24 0 0.44"/>
    {
      variation: 'linear',
      affine: [-0.15, 0.28, 0.0,
        0.26, 0.24, 0.44],
      color: 1.0,
      speed: 0.5,
      weight: 0.07,
    },
  ]
}

export function example() {
  return [
    {
      variation: 'linear',
      affine: [0.5, 0.0, 0.0,
        0.0, 0.5, -0.5],
      color: 0,
      speed: 0.5,
      weight: 1,
    },
    {
      variation: 'linear',
      affine: [0.5, 0.0, -0.5,
        0.0, 0.5, 0.5],
      color: 0,
      speed: 0.5,
      weight: 1,
    },
    {
      variation: 'sinusoidal',
      affine: [0.5, 0.0, 0.5,
        0.0, 0.5, 0.5],
      color: 1,
      speed: 0.5,
      weight: 1,
    },
    {
      variation: 'linear',
      affine: [-2.0, 0.0, 0.0,
        0.0, -2.0, 0.0],
      color: 0,
      speed: 0.5,
      weight: 1,
    },
  ];
}

export function test1(): XForm[] {
  return [
    {
      variation: 'spherical',
      affine: [-0.681206, 0.20769, -0.0416126,
        -0.0779465, 0.755065, -0.262334],
      weight: 0.25,
      color: 1.0,
      speed: 0.5,
    },
    {
      variation: 'spherical',
      affine: [0.953766, 0.43268, 0.642503,
        0.48396, -0.0542476, -0.995898],
      weight: 0.25,
      color: 0.66,
      speed: 0.5,
    },
    {
      variation: 'spherical',
      affine: [0.840613, 0.318971, 0.905589,
        -0.816191, -0.430402, 0.909402],
      weight: 0.25,
      color: 0.33,
      speed: 0.5,
    },
    {
      variation: 'spherical',
      affine: [0.960492, 0.215383, -0.126074,
        -0.466555, -0.727377, 0.253509],
      weight: 0.25,
      color: 0.0,
      speed: 0.5,
    },
  ];
}

