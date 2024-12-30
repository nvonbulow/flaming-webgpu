use './types'::{ HistogramInput, HistogramBucketInput };

@link fn getSize() -> vec2<u32> {}

// args
@link fn getGamma() -> f32 {}

// inputs
@link var<storage> histogram: HistogramInput;

@link var<storage> histogram_max: u32;

@link var<storage, read_write> texture: texture_storage_2d<rgba32float, write>;

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

    // gamma correction
    color = pow(color, vec3(getGamma()));

    textureStore(texture, vec2<u32>(x, y), vec4<f32>(color, alpha));
}
