use '@use-gpu/wgsl/use/array'::{ sizeToModulus2, packIndex2 };
use './types'::{ XForm, Flame, Histogram };
use './random'::{ seed, rand, frand, hash };

@link fn getSize() -> vec2<u32> {}
@link var<storage> xforms: array<XForm>;

@link var<storage, read_write> histogram: Histogram;

const RANGE_X: vec2<f32> = vec2<f32>(-1.0, 1.0);
const RANGE_Y: vec2<f32> = vec2<f32>(-1.0, 1.0);
const NUM_XFORMS: u32 = 3;
const HISTOGRAM_SIZE: vec2<u32> = vec2<u32>(800, 600);

fn scaleMatrix() -> mat3x3<f32> {
  let size = HISTOGRAM_SIZE;
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

  let size = HISTOGRAM_SIZE;
  var offset = u32(ps.x) * size.y + u32(ps.y);
  if ps.x < 0 || ps.y < 0 || ps.x >= i32(size.x) || ps.y >= i32(size.y) {
    offset = u32(0);
  }
  atomicAdd(&histogram.bins[offset], 1);
}

fn apply_xform(xform: XForm, p: vec3<f32>) -> vec3<f32> {
  let T = mat3x3<f32>(
    vec3f(xform.affine[0], 0.0),
    vec3f(xform.affine[1], 0.0),
    vec3f(xform.affine[2], 1.0),
  );
  let pt = vec3<f32>(p.xy, 1.0) * T;
  // todo: color blending
  return vec3<f32>(pt.xy, p.z);
}

fn next(p: vec3<f32>) -> vec3<f32> {
  let xform = xforms[rand() % NUM_XFORMS - 1];
  let pt = apply_xform(xform, p);
  return pt;
}

@compute @workgroup_size(1)
fn main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  // unused but needed for linker
  let s = getSize();

  let size = HISTOGRAM_SIZE;
  
  seed(hash(globalId.x * size.y + globalId.y));

  // IMPORTANT!!: z is the color of the point
  var p = vec3<f32>((frand() - 0.5) * 2, (frand() - 0.5) * 2, 0.0);
  // var p = vec3<f32>(0.0, 0.0, 0.0);
  // skip first 15 iterations
  for (var i = 0u; i < 15u; i += 1u) {
    p = next(p);
  }
  for (var i = 0u; i < 100000u; i += 1u) {
    plot(p);
    p = next(p);
  }
}

