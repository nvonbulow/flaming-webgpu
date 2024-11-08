// From: https://nullprogram.com/blog/2018/07/31/

var<private> random_state: u32;

@export fn hash(v: u32) -> u32 {
  var x: u32 = v;
  x = x ^ (x >> 17u);
  x = x * 0xED5AD4BBu;
  x = x ^ (x >> 11u);
  x = x * 0xAC4C1B51u;
  x = x ^ (x >> 1u);
  x = x * 0x31848BABu;
  x = x ^ (x >> 14u);
  return x;
}

@export fn seed(v: u32) { random_state = v; }

@export fn rand() -> u32 {
  random_state = hash(random_state);
  return random_state;
}

@export fn frand() -> f32 {
  return f32(rand()) / 0xFFFFFFFF.0;
}
