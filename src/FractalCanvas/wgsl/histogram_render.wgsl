use './types'::{ HistogramInput, HistogramBucketInput };

@link fn getSize() -> vec2<u32> {}

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

    let color = vec3<f32>(1.0, 1.0, 1.0);
    // log scale with max
    let log_scale = log(f32(bucket.count)) / log(f32(max));
    textureStore(texture, vec2<u32>(x, y), vec4<f32>(color, log_scale));
}
