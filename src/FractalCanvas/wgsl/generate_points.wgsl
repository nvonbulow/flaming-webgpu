use '@use-gpu/wgsl/use/array'::{ sizeToModulus2, packIndex2 };
use './types'::{ XForm, Flame, Histogram };
use './random'::{ seed, rand, frand, hash };

@link fn getSize() -> vec2<u32> {}

@link var<storage> xforms: array<XForm>;

@link var<storage, read_write> histogram: Histogram;

const RANGE_X: vec2<f32> = vec2<f32>(-1.0, 1.0);
const RANGE_Y: vec2<f32> = vec2<f32>(-1.0, 1.0);

fn scaleMatrix() -> mat3x3<f32> {
  let size = getSize();
  let x_factor = f32(size.x - 1) / (RANGE_X.y - RANGE_X.x);
  let y_factor = f32(size.y - 1) / (RANGE_Y.y - RANGE_Y.x);

  return mat3x3<f32>(
    x_factor,      0.0, -x_factor * RANGE_X.x,
         0.0, y_factor, -y_factor * RANGE_Y.x,
         0.0,      0.0,                   1.0,
  );
}

fn scalePoint(p: vec2<f32>) -> vec2<i32> {
  let scale = scaleMatrix();
  let scaled = vec3<f32>(p, 1.0) * scale;
  return vec2<i32>(round(scaled).xy);
}

fn plot(p: vec3<f32>) {
  // scaled point
  let ps = vec2<i32>(scalePoint(p.xy));

  let size = getSize();
  var offset = u32(ps.x) * size.y + u32(ps.y);
  if ps.x < 0 || ps.y < 0 || ps.x >= i32(size.x) || ps.y >= i32(size.y) {
    offset = u32(0);
  }
  atomicAdd(&histogram.bins[offset], 1);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let size = getSize();
  
  seed(hash(globalId.x * size.y + globalId.y));

  if any(globalId.xy >= size) { return; }
  let fragmentId = globalId.xy;

  let modulus = sizeToModulus2(size);
  let index = packIndex2(fragmentId, modulus);

  let xform = xforms[0];

  // IMPORTANT!!: z is the color of the point
  let p = vec3<f32>((frand() - 0.5) * 2, (frand() - 0.5) * 2, 0.0);

  plot(p);
}

