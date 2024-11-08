use './types'::{ XForm, Flame, Histogram };
use '@use-gpu/wgsl/use/array'::{ sizeToModulus2, packIndex2 };

@link fn getSize() -> vec2<u32> {}
// @link var<storage> xforms: array<u32>;
@link var<storage, read_write> histogram: Histogram;

// fn plot(p: vec3<f32>) {
//   let size = getSize();
//   let offset = u32(p.x) * size.y + u32(p.y);
//   // atomicAdd(&histogram.bins[offset], 1);
// }

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) globalId: vec3<u32>) {
    // checkerboard pattern, 8 px by 8 px
    let size = getSize();
    if any(globalId.xy >= size) { return; }
    let fragmentId = globalId.xy;

    let modulus = sizeToModulus2(size);
    let index = packIndex2(fragmentId, modulus);

    let gridSize = /*getGridSize();*/ u32(8);
    if gridSize == 0 { return; }
    let checkerX = fragmentId.x / gridSize;
    let checkerY = fragmentId.y / gridSize;

    let value = select(0.0, 1.0, (checkerX + checkerY) % 2 == 0);
    atomicStore(&histogram.bins[index], u32(value));
}

