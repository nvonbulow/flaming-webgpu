@export struct XForm {
  variation_id: u32,
  color: f32,
  /*
    [a, b, c]
    [d, e, f]
    [0, 0, 1]
  */
  affine: mat3x2<f32>,
  weight: f32,
};

@export struct Flame {
  size: u32,
  xforms: array<XForm>,
};

@export struct Histogram {
  bins: array<atomic<u32>>,
};

@export struct HistogramInput {
  bins: array<u32>,
};

