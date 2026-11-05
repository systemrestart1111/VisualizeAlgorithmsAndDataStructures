const TRAIN = [['spam', 'free money now'], ['spam', 'win free prize now'], ['spam', 'claim your free money'], ['spam', 'cheap prize offer'],
  ['ham', 'meeting at noon'], ['ham', 'project meeting notes'], ['ham', 'lunch at noon tomorrow'], ['ham', 'your project report']];
const vocab = new Set(TRAIN.flatMap(([, t]) => t.split(' ')));
const count = { spam: {}, ham: {} }, total = { spam: 0, ham: 0 };
for (const [c, t] of TRAIN) for (const w of t.split(' ')) { count[c][w] = (count[c][w] ?? 0) + 1; total[c]++; }

// score[c] = log P(c) + Σ log((count + α) / (total + α|V|))；α = 0 時未見過的字得到 −∞
function score(c, msg, alpha) {
  let s = Math.log(TRAIN.filter(([k]) => k === c).length / TRAIN.length);
  for (const w of msg.split(' ')) {
    const num = (count[c][w] ?? 0) + alpha;
    if (num === 0) return -Infinity;
    s += Math.log(num / (total[c] + alpha * vocab.size));
  }
  return s;
}
const fmt = (v) => (v === -Infinity ? '-inf' : v.toFixed(3));

for (const msg of ['free lunch meeting', 'win cheap money', 'project notes tomorrow', 'free coffee now'])
  for (const alpha of [1, 0]) {
    const sp = score('spam', msg, alpha), hm = score('ham', msg, alpha);
    const pred = sp === -Infinity && hm === -Infinity ? 'undecidable' : sp >= hm ? 'spam' : 'ham';
    console.log(`'${msg}', alpha ${alpha}: spam ${fmt(sp)}, ham ${fmt(hm)} -> ${pred}`);
  }
