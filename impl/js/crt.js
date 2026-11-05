function modInverse(a, m) {
  let [oldR, r, oldT, t] = [m, a % m, 0, 1];
  while (r) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldT, t] = [t, oldT - q * t];
  }
  return ((oldT % m) + m) % m;
}

// x = Σ a_i · M_i · (M_i⁻¹ mod m_i)，其中 M_i = M / m_i；每一項只在自己的模數下不為 0
const EQS = [[2, 3], [3, 5], [2, 7]]; // x ≡ a (mod m)，模數兩兩互質
const M = EQS.reduce((p, [, m]) => p * m, 1);
let x = 0;
for (const [a, m] of EQS) {
  const Mi = M / m, inv = modInverse(Mi, m);
  console.log(`a=${a}, m=${m}: M_i = ${Mi}, M_i^-1 mod ${m} = ${inv}, term = ${a * Mi * inv}`);
  x += a * Mi * inv;
}
console.log(`x = ${x % M} (mod ${M})`);
