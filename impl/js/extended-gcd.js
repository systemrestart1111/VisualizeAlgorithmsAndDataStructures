// 同時維護係數：每一列都滿足 r = a·s + b·t；最後非零的 r 就是 gcd
function extGcd(a, b) {
  let [oldR, r, oldS, s, oldT, t] = [a, b, 1, 0, 0, 1];
  const pad = (x, w) => String(x).padStart(w);
  console.log(`${pad('q', 4)} ${pad('r', 5)} ${pad('s', 5)} ${pad('t', 5)}`);
  console.log(`${pad('', 4)} ${pad(oldR, 5)} ${pad(oldS, 5)} ${pad(oldT, 5)}`);
  while (r) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
    [oldT, t] = [t, oldT - q * t];
    console.log(`${pad(q, 4)} ${pad(oldR, 5)} ${pad(oldS, 5)} ${pad(oldT, 5)}`);
  }
  return [oldR, oldS, oldT];
}

const [g, x, y] = extGcd(240, 46);
console.log(`gcd = ${g}, 240 x (${x}) + 46 x (${y}) = ${240 * x + 46 * y}`);
