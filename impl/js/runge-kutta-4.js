// 每步四個斜率：起點、兩個中點、終點，以 1:2:2:1 加權
function rk4(f, y0, h, T) {
  let t = 0, y = y0;
  const n = Math.round(T / h);
  for (let k = 0; k < n; k++) {
    const k1 = f(t, y), k2 = f(t + h / 2, y + (h * k1) / 2), k3 = f(t + h / 2, y + (h * k2) / 2), k4 = f(t + h, y + h * k3);
    y += (h * (k1 + 2 * k2 + 2 * k3 + k4)) / 6;
    t = (k + 1) * h;
  }
  return y;
}
function euler(f, y0, h, T) {
  let t = 0, y = y0;
  const n = Math.round(T / h);
  for (let k = 0; k < n; k++) { y += h * f(t, y); t = (k + 1) * h; }
  return y;
}

const odes = [
  ["y' = y, y(0) = 1", (t, y) => y, 2, Math.exp(2)],
  ["y' = -2ty, y(0) = 1", (t, y) => -2 * t * y, 2, Math.exp(-4)],
  ["y' = t - y, y(0) = 1", (t, y) => t - y, 3, 3 - 1 + 2 * Math.exp(-3)],
];
for (const [name, f, T, exact] of odes) {
  for (const h of [0.5, 0.25, 0.1]) {
    const y = rk4(f, 1, h, T), ye = euler(f, 1, h, T);
    console.log(`${name}, h = ${h}: y(${T}) rk4 ${y.toFixed(8)} (err ${Math.abs(y - exact).toFixed(8)}), euler ${ye.toFixed(8)} (err ${Math.abs(ye - exact).toFixed(8)})`);
  }
  const e1 = Math.abs(rk4(f, 1, 0.2, T) - exact), e2 = Math.abs(rk4(f, 1, 0.1, T) - exact);
  console.log(`  halving h from 0.2 to 0.1 shrinks rk4 error by ${(e1 / e2).toFixed(1)}x`);
}
