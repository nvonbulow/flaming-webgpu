use './random'::{ frand };

const PI = radians(180.0);

@export fn apply_variation(variation_id: u32, affine: mat3x3<f32>, p: vec2f) -> vec2f {
  // dependent variations are not yet working
  switch (variation_id) {
    case 0u: { return linear(p); }
    case 1u: { return sinusoidal(p); }
    case 2u: { return spherical(p); }
    case 3u: { return swirl(p); }
    case 4u: { return horseshoe(p); }
    case 5u: { return polar(p); }
    case 6u: { return handkerchief(p); }
    case 7u: { return heart(p); }
    case 8u: { return disc(p); }
    case 9u: { return spiral(p); }
    case 10u: { return hyperbolic(p); }
    case 11u: { return diamond(p); }
    case 12u: { return ex(p); }
    case 13u: { return julia(p); }
    case 14u: { return bent(p); }
    // dependent
    // case 15u: { return waves(p, affine); }
    case 16u: { return fisheye(p); }
    // dependent
    // case 17u: { return popcorn(p, affine); }
    case 18u: { return exponential(p); }
    case 19u: { return power(p); }
    case 20u: { return cosine(p); }
    // dependent
    // case 21u: { return rings(p, affine); }
    // dependent
    // case 22u: { return fan(p, affine); }

    // not yet implemented:
    // parametric
    // 23u: { return blob(p); }
    // parametric
    // 24u: { return pdj(p); }
    // parametric
    // 25u: { return fan2(p); }
    // parametric
    // 26u: { return rings2(p); }
    // case 27u: { return eyefish(p); }
    // case 28u: { return bubble(p); }
    // case 29u: { return cylinder(p); }
    // parametric
    // 30u: { return perspective(p); }
    // case 31u: { return noise(p); }
    // parametric
    // case 32u: { return juliaN(p); }
    // parametric
    // case 33u: { return juliaScope(p); }
    // case 34u: { return blur(p); }
    // case 35u: { return gaussian(p); }
    // parametric
    // case 36u: { return radialBlur(p); }
    // parametric
    // case 37u: { return pie(p); }
    // parametric
    // case 38u: { return ngon(p); }
    // parametric
    // case 39u: { return curl(p); }
    // parametric
    // case 40u: { return rectangles(p); }
    // case 41u: { return arch(p); }
    // case 42u: { return tangent(p); }
    // case 43u: { return square(p); }
    // case 44u: { return rays(p); }
    // case 45u: { return blade(p); }
    // case 46u: { return secant(p); }
    // case 47u: { return twintrian(p); }
    // case 48u: { return cross(p); }
    default: { return p; }
  }
}

fn linear(p: vec2f) -> vec2f {
  return p;
}

fn sinusoidal(p: vec2f) -> vec2f {
  return sin(p);
}

fn spherical(p: vec2f) -> vec2f {
  let r2 = dot(p, p);
  return p / r2;
}

fn swirl(p: vec2f) -> vec2f {
  let r2 = dot(p, p);
  let cr2 = cos(r2);
  let sr2 = sin(r2);
  return vec2f(p.x * sr2 - p.y * cr2, p.x * cr2 + p.y * sr2);
}

fn horseshoe(p: vec2f) -> vec2f {
  let r = length(p);
  return vec2f((p.x - p.y) * (p.x + p.y), 2.0 * p.x * p.y) / r;
}

fn polar(p: vec2f) -> vec2f {
  let theta = atan2(p.x, p.y);
  let r = length(p);
  return vec2f(theta / PI, r - 1.0);
}

fn handkerchief(p: vec2f) -> vec2f {
  let theta = atan2(p.x, p.y);
  let r = length(p);
  return r * vec2f(sin(theta + r), cos(theta - r));
}

fn heart(p: vec2f) -> vec2f {
  let theta = atan2(p.x, p.y);
  let r = length(p);
  return r * vec2f(sin(theta * r), -cos(theta * r));
}

fn disc(p: vec2f) -> vec2f {
  let theta = atan2(p.x, p.y);
  let r = length(p);
  return theta / PI * vec2f(sin(PI * r), cos(PI * r));
}

fn spiral(p: vec2f) -> vec2f {
  let theta = atan2(p.x, p.y);
  let r = length(p);
  return vec2f(cos(theta) + sin(r), sin(theta) - cos(r)) / r;
}

fn hyperbolic(p: vec2f) -> vec2f {
  let theta = atan2(p.x, p.y);
  let r = length(p);
  return vec2f(sin(theta) / r, r * cos(theta));
}

fn diamond(p: vec2f) -> vec2f {
  let theta = atan2(p.x, p.y);
  let r = length(p);
  return vec2f(sin(theta) * cos(r), cos(theta) * sin(r));
}

fn ex(p: vec2f) -> vec2f {
  let theta = atan2(p.x, p.y);
  let r = length(p);
  let p0 = sin(theta + r);
  let p1 = cos(theta - r);
  return r * vec2f(pow(p0, 3.0) + pow(p1, 3.0), pow(p0, 3.0) - pow(p1, 3.0));
}

fn julia(p: vec2f) -> vec2f {
  let theta = atan2(p.x, p.y);
  let r = length(p);
  let omega = select(0.0, PI, frand() < 0.5);
  return sqrt(r) * vec2f(cos(theta / 2.0 + omega), sin(theta / 2.0 + omega));
}

fn bent(p: vec2f) -> vec2f {
  if p.x >= 0.0 && p.y >= 0.0 {
    return vec2f(p.x, p.y);
  } else if p.x < 0.0 && p.y >= 0.0 {
    return vec2f(2.0 * p.x, p.y);
  } else if p.x >= 0.0 && p.y < 0.0 {
    return vec2f(p.x, p.y / 2.0);
  } else {
    return vec2f(2.0 * p.x, p.y / 2.0);
  }
}

fn waves(p: vec2f, affine: mat3x3<f32>) -> vec2f {
  let b = affine[1][0];
  let c = affine[2][0];
  let e = affine[1][1];
  let f = affine[2][1];

  return vec2f(p.x + b * sin(p.y / (c * c)), p.y + e * sin(p.x / (f * f)));
}

fn fisheye(p: vec2f) -> vec2f {
  let r = length(p);
  return 2.0 * vec2f(p.y, p.x) / (r + 1.0);
}

fn popcorn(p: vec2f, affine: mat3x3<f32>) -> vec2f {
  let c = affine[2][0];
  let f = affine[2][1];

  return vec2f(p.x + c * sin(tan(3.0 * p.y)), p.y + f * sin(tan(3.0 * p.x)));
}

fn exponential(p: vec2f) -> vec2f {
  return exp(p.x - 1.0) * vec2f(cos(PI * p.y), sin(PI * p.y));
}

fn power(p: vec2f) -> vec2f {
  let theta = atan2(p.x, p.y);
  let r = length(p);
  return pow(r, sin(theta)) * vec2f(cos(theta), sin(theta));
}

fn cosine(p: vec2f) -> vec2f {
  return vec2f(cos(PI * p.x) * cosh(p.y), -sin(PI * p.x) * sinh(p.y));
}

fn rings(p: vec2f, affine: mat3x3<f32>) -> vec2f {
  let r = length(p);
  let theta = atan2(p.x, p.y);
  let c = affine[2][0];

  let l = (r + c * c) % (2 * c * c) - c * c + r * (1.0 - c * c);
  return l * vec2f(cos(theta), sin(theta));
}

fn fan(p: vec2f, affine: mat3x3<f32>) -> vec2f {
  let r = length(p);
  let theta = atan2(p.x, p.y);
  let c = affine[2][0];
  let f = affine[2][1];

  let t = PI * c * c;

  if ((theta + f) % t > t / 2) {
    return r * vec2f(cos(theta - t / 2), sin(theta - t / 2));
  } else {
    return r * vec2f(cos(theta + t / 2), sin(theta + t / 2));
  }
}

