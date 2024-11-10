use './types'::{ HistogramInput, HistogramBucketInput };

// output size
@link fn getSize() -> vec2<u32>;

// Number of samples per output pixel
@link fn getSupersampleFactor() -> u32 {};

// input histogram
@link var<storage> input_hist: HistogramInput;
// output histogram
@link var<storage, read_write> output_hist: HistogramInput;

fn getBinIdx(size: vec2<u32>, coord: vec2<u32>) -> u32 {
  return coord.y * size.x + coord.x;
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let sample_factor = getSupersampleFactor();
  let output_size = getSize();
  let input_size = getSize() * sample_factor;
  
  var output_bucket = HistogramBucketInput(0, 0, 0, 0);

  for (var x = 0u; x < sample_factor; x += 1) {
    for (var y = 0u; y < sample_factor; y += 1) {
      let input_bucket = input_hist.bins[getBinIdx(input_size, vec2<u32>(gid.xy * sample_factor) + vec2<u32>(x, y))];
      output_bucket.r += input_bucket.r;
      output_bucket.g += input_bucket.g;
      output_bucket.b += input_bucket.b;
      output_bucket.count += input_bucket.count;
    }
  }

  output_hist.bins[getBinIdx(output_size, gid.xy)] = output_bucket;
}

