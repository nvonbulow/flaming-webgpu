use '@use-gpu/wgsl/use/array'::{ sizeToModulus2, packIndex2 };
use './variations'::{ apply_variation };
use './types'::{ XForm, Flame, Histogram, HistogramBucket };
use './random'::{ seed, rand, frand, hash };

// unused but linker complains otherwise
@link fn getSize() -> vec2<u32> {}
// arguments:
// random seed
@link fn getSeed() -> u32 {}
@link fn getHistogramSize() -> vec2<u32> {}
@link fn getCameraMatrix() -> mat3x3<f32> {}
@link fn getBatchSize() -> u32 {}
@link fn getPaletteSize() -> u32 {}
@link var<storage> xforms: array<XForm>;
// palette of colors
@link var<storage> cmap: array<vec3<f32>>;

@link var<storage, read_write> histogram: Histogram;

fn scalePoint(p: vec2<f32>) -> vec2<i32> {
  let scale = getCameraMatrix();
  let scaled = scale * vec3<f32>(p, 1.0);
  return vec2<i32>(round(scaled).xy);
}

fn hsv2rgb(c: vec3<f32>) -> vec3<f32> {
    let K = vec4<f32>(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    let p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, vec3(0.0), vec3(1.0)), c.y);
}

fn sample_cmap(col: f32) -> vec3<f32> {
  let c = col;
  // for some reason arraySize is returning the wrong length
  var paletteSize = getPaletteSize();
  var idx = c * f32(paletteSize - 1);
  var c1 = cmap[u32(floor(idx))];
  var c2 = cmap[u32(ceil(idx))];
  return mix(c1, c2, fract(idx));
}

// HSV, full saturation and value
fn sample_cmap_hsv(c: f32) -> vec3<f32> {
  return hsv2rgb(vec3<f32>(c, 1.0, 1.0));
}

fn sample_cmap2(c: f32) -> vec3<f32> {
  // interpolate between <r, g, b> colors
  // 0 -> red, 0.5 -> green, 1 -> blue
  let r = vec3<f32>(1.0, 0.0, 0.0);
  let g = vec3<f32>(0.0, 1.0, 0.0);
  let b = vec3<f32>(0.0, 0.0, 1.0);

  if c < 0.5 {
    return mix(r, g, c * 2.0);
  } else {
    return mix(g, b, (c - 0.5) * 2.0);
  }
}

fn plot(p: vec3<f32>) {
  // scaled point
  let ps = vec2<i32>(scalePoint(p.xy));

  let size = getHistogramSize();
  var offset = u32(ps.y) * size.x + u32(ps.x);
  if ps.x < 0 || ps.y < 0 || ps.x >= i32(size.x) || ps.y >= i32(size.y) {
    offset = u32(0);
  }
  let color = sample_cmap(p.z);
  atomicAdd(&histogram.bins[offset].count, 1);
  atomicAdd(&histogram.bins[offset].r, u32(round(color.r * 255.0)));
  atomicAdd(&histogram.bins[offset].g, u32(round(color.g * 255.0)));
  atomicAdd(&histogram.bins[offset].b, u32(round(color.b * 255.0)));
}

fn apply_xform(xform: XForm, p: vec3<f32>) -> vec3<f32> {
  // apply affine transform
  var pt = (vec3<f32>(p.xy, 1.0) * xform.affine).xy;

  // apply non-linear transform
  pt = apply_variation(xform.variation_id, xform.affine, pt.xy);

  // todo: post variation

  // Mix in color
  let c = mix(p.z, xform.color, xform.speed);
  return vec3<f32>(pt.xy, c);
}

fn rand_xform() -> XForm {
  // For now, assume weights have been normalized
  let r = frand();
  var sum = 0.0;
  var i = 0u;

  let count = arrayLength(&xforms);
  for (; i < count; i += 1u) {
    let xform = xforms[i];
    sum += xform.weight;
    if r < sum {
      break;
    }
  }
  
  return xforms[i];
}

fn next(p: vec3<f32>) -> vec3<f32> {
  let xform = rand_xform();
  let pt = apply_xform(xform, p);
  return pt;
}

@compute @workgroup_size(16)
fn main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  // unused but needed for linker
  let s = getSize();

  seed(hash(globalId.x + 1u) ^ hash(getSeed()));

  // Choose a random starting point in the range [-1, 1]
  var p = vec3<f32>((frand() - 0.5) * 2, (frand() - 0.5) * 2, 0.0);

  // skip first 15 iterations to allow for convergence
  for (var i = 0u; i < 15u; i += 1u) {
    p = next(p);
  }
  for (var i = 0u; i < getBatchSize(); i += 1u) {
    plot(p);
    p = next(p);
  }
}

