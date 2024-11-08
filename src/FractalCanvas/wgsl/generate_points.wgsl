use '@use-gpu/wgsl/use/array'::{ sizeToModulus2, packIndex2 };
use './types'::{ XForm, Flame, Histogram };
use './random'::{ seed, rand, frand, hash };

@link fn getSize() -> vec2<u32> {}

@link var<storage> xforms: array<XForm>;

@link var<storage, read_write> histogram: Histogram;

// fn plot(p: vec3<f32>) {
//   let size = getSize();
//   let offset = u32(p.x) * size.y + u32(p.y);
//   // atomicAdd(&histogram.bins[offset], 1);
// }

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  seed(hash(globalId.x) ^ hash(globalId.y));

  let size = getSize();
  if any(globalId.xy >= size) { return; }
  let fragmentId = globalId.xy;

  let modulus = sizeToModulus2(size);
  let index = packIndex2(fragmentId, modulus);

  let xform = xforms[0];

  let value = rand();

  atomicStore(&histogram.bins[index], u32(value));
}

