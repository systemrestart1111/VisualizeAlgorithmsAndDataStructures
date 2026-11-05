function mobius(x) {
  let k = 0, sq = false;
  for (let d = 2; d * d <= x; d++)
    if (x % d === 0) { x /= d; k++; if (x % d === 0) sq = true; while (x % d === 0) x /= d; }
  if (x > 1) k++;
  return sq ? 0 : k % 2 ? -1 : 1;
}

// g(n) = Σ_{d|n} f(d)；再以 f(n) = Σ_{d|n} μ(n/d)·g(d) 還原
function run(f) {
  const N = f.length, g = [0], back = [0];
  for (let n = 1; n <= N; n++) { g[n] = 0; for (let d = 1; d <= n; d++) if (n % d === 0) g[n] += f[d - 1]; }
  for (let n = 1; n <= N; n++) { back[n] = 0; for (let d = 1; d <= n; d++) if (n % d === 0) back[n] += mobius(n / d) * g[d]; }
  console.log(`g: ${g.slice(1).join(' ')}`);
  console.log(`f recovered: ${back.slice(1).join(' ')} (match ${back.slice(1).every((v, i) => v === f[i]) ? 'True' : 'False'})`);
}

run([1, 1, 2, 2, 4, 2, 6, 4, 6, 4, 10, 4]);
run([3, -1, 4, 1, -5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3]);
run(new Array(12).fill(1));
