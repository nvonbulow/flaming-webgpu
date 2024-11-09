@export struct XForm {
  variation_id: u32,
  color: f32,
  /*
    [a, b, c]
    [d, e, f]
    [0, 0, 1]
  */
  affine: mat3x3<f32>,
  weight: f32,
};

@export struct Flame {
  size: u32,
  xforms: array<XForm>,
};

@export struct HistogramBucket {
  // atomic<float> is not supported
  r: atomic<u32>,
  g: atomic<u32>,
  b: atomic<u32>,
  count: atomic<u32>,
};

@export struct Histogram {
  // rgba = rgb, count
  bins: array<HistogramBucket>,
};

@export struct HistogramBucketInput {
  r: u32,
  g: u32,
  b: u32,
  count: u32,
};

@export struct HistogramInput {
  bins: array<HistogramBucketInput>,
};

