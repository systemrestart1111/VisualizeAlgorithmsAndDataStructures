const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const F = (n, d) => { const g = gcd(n, d) || 1; return { n: n / g, d: d / g }; };
const add = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
const mul = (a, b) => F(a.n * b.n, a.d * b.d);
const div = (a, b) => F(a.n * b.d, a.d * b.n);
const str = (f) => (f.d === 1 ? String(f.n) : `${f.n}/${f.d}`);

// 事件樹：路徑機率 = 沿途條件機率相乘
function twoDraws(red, blue, replace) {
  const total = red + blue, out = {};
  for (const first of 'RB') {
    const p1 = F(first === 'R' ? red : blue, total);
    const [r2, b2, t2] = replace ? [red, blue, total] : first === 'R' ? [red - 1, blue, total - 1] : [red, blue - 1, total - 1];
    for (const second of 'RB') out[first + second] = mul(p1, F(second === 'R' ? r2 : b2, t2));
  }
  return out;
}

for (const replace of [true, false]) {
  const p = twoDraws(3, 2, replace);
  console.log(replace ? 'with replacement' : 'without replacement');
  for (const [k, v] of Object.entries(p)) console.log(`  P(${k}) = ${str(v)}`);
  const second = add(p.RR, p.BR), cond = div(p.RR, add(p.RR, p.RB));
  console.log(`  P(2nd R) = ${str(second)}, P(2nd R | 1st R) = ${str(cond)}, independent = ${str(second) === str(cond) ? 'True' : 'False'}`);
  console.log(`  E[#red] = ${str(add(mul(F(2, 1), p.RR), add(p.RB, p.BR)))}`);
}
