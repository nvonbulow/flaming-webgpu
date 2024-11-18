use './types'::{ HistogramInput, HistogramBucketInput };

@link fn getSize() -> vec2<u32> {}

// args
@link fn getGamma() -> f32 {}

// inputs
@link var<storage> histogram: HistogramInput;

@link var<storage> histogram_max: u32;

@link var<storage, read_write> texture: texture_storage_2d<rgba32float, write>;

// Adapted from: https://drafts.csswg.org/css-color-4/#color-conversion-code
fn gam_sRGB(RGB: vec3<f32>) -> vec3<f32> {
  // convert an array of linear-light sRGB values in the range 0.0-1.0
  // to gamma corrected form
  // https://en.wikipedia.org/wiki/SRGB
  // Extended transfer function:
  // For negative values, linear portion extends on reflection
  // of axis, then uses reflected pow below that
  let sign_per_channel = sign(RGB);
  let abs_RGB = abs(RGB);
  let non_linear_mask = abs_RGB > vec3<f32>(0.0031308);
  let non_linear_RGB = sign_per_channel * (1.055 * pow(RGB, vec3<f32>(1./2.4)) - 0.055);
  let linear_RGB = 12.92 * RGB;
  return select(linear_RGB, non_linear_RGB, non_linear_mask);
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    let size = getSize();
    let x = gid.x;
    let y = gid.y;
    let idx = y * size.x + x;
    
    let bucket = histogram.bins[idx];
    let max = histogram_max;

    // log scale with max
    let logBucket = select(0, log(f32(bucket.count)), bucket.count > 0);
    let alpha = logBucket / log(f32(max));
    var color = vec3(f32(bucket.r), f32(bucket.g), f32(bucket.b)) / 255.0;
    if (bucket.count == 0) {
      color = vec3f(0.0);
    }
    else {
      color = color / (f32(bucket.count));
    } 

    // Post processing
    // Gamma correction
    // color = color * pow(alpha, (1.0 / getGamma()));

    // color = gam_sRGB(color);

    textureStore(texture, vec2<u32>(x, y), vec4<f32>(color, alpha));
}
