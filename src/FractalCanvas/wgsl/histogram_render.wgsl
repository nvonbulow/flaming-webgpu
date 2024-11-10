use './types'::{ HistogramInput, HistogramBucketInput };

@link fn getSize() -> vec2<u32> {}

// args
@link fn getGamma() -> f32 {}

// inputs
@link var<storage> histogram: HistogramInput;

@link var<storage> histogram_max: u32;

@link var<storage, read_write> texture: texture_storage_2d<rgba32float, write>;
@link var<storage, read_write> texture_buf: array<vec4<f32>>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    let size = getSize();
    let x = gid.x;
    let y = gid.y;
    let idx = y * size.x + x;
    
    let bucket = histogram.bins[idx];
    let max = histogram_max;

    // log scale with max
    let log_scale = log(f32(bucket.count)) / log(f32(max));
    var color = vec3(f32(bucket.r), f32(bucket.g), f32(bucket.b));
    color = color / (f32(bucket.count) + 1.0) * log_scale / 256.0;

    // Post processing
    // Gamma correction
    color = color * pow(log_scale, (1.0 / getGamma()));
    
    textureStore(texture, vec2<u32>(x, y), vec4<f32>(color, log_scale));
    texture_buf[idx] = vec4<f32>(color, log_scale);
}
