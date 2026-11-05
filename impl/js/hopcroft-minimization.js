// 龍書範例：(a|b)*abb 的 5 狀態 DFA
const STATES = ['A', 'B', 'C', 'D', 'E'];
const DELTA = { A: { a: 'B', b: 'C' }, B: { a: 'B', b: 'D' }, C: { a: 'B', b: 'C' }, D: { a: 'B', b: 'E' }, E: { a: 'B', b: 'C' } };
const ACCEPT = new Set(['E']);
const ALPHA = ['a', 'b'];

// P 從「接受／非接受」開始；用 W 中的分組 A 與字元 c 切開所有分組
function hopcroft() {
  let P = [[...ACCEPT], STATES.filter((q) => !ACCEPT.has(q))];
  const W = [P[0].length <= P[1].length ? P[0] : P[1]];
  while (W.length) {
    const A = W.shift();
    for (const c of ALPHA) {
      const X = new Set(STATES.filter((q) => A.includes(DELTA[q][c])));
      const NP = [];
      for (const Y of P) {
        const inter = Y.filter((q) => X.has(q)), diff = Y.filter((q) => !X.has(q));
        if (inter.length && diff.length) {
          NP.push(inter, diff);
          const wi = W.findIndex((g) => g.join() === Y.join());
          if (wi >= 0) W.splice(wi, 1, inter, diff); else W.push(inter.length <= diff.length ? inter : diff);
        } else NP.push(Y);
      }
      P = NP;
    }
  }
  return P;
}

const P = hopcroft();
const rep = {};
for (const g of P) for (const q of g) rep[q] = [...g].sort().join('');
console.log('minimal states:', P.length, 'groups:', P.map((g) => [...g].sort().join('')).sort().map((g) => `{${g}}`).join(' '));
const words = [''];
for (let L = 1; L <= 6; L++) for (const w of words.filter((x) => x.length === L - 1)) for (const c of ALPHA) words.push(w + c);
let same = 0;
for (const w of words) {
  let s = 'A', g = rep.A;
  for (const ch of w) { s = DELTA[s][ch]; g = rep[DELTA[g[0]][ch]]; }
  if (ACCEPT.has(s) === (g === rep.E)) same++;
}
console.log(`same language on ${same}/${words.length} strings up to length 6`);
