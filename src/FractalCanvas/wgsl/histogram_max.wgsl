use './types'::{ XForm, Flame, HistogramInput };

@link fn getSize() -> vec2<u32> {}

@link var<storage, read_write> histogram: HistogramInput;

@link var<storage, read_write> histogram_max: atomic<u32>;

// here we split up the work into 64 threads
// todo: run more groups to fill up the GPU
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let size = getSize();
  let count = size.x * size.y;

  let startRow = gid.x * size.y / 64;
  let endRow = (gid.x + 1) * size.y / 64;

  let startIdx = startRow * size.x;
  let endIdx = endRow * size.x;

  var max: u32 = 0;
  for (var i = startIdx; i < endIdx; i += 1) {
    let val = histogram.bins[i];
    if (val > max) {
      max = val;
    }
  }

  atomicMax(&histogram_max, max);
}
