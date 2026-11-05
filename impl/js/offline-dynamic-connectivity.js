const EVENTS = '+ 1 2; + 2 3; ? 1 3; + 4 5; - 2 3; ? 1 3; + 3 4; ? 1 5; + 1 3; ? 2 5; - 1 2; ? 2 5';
const ev = EVENTS.split('; ').map((s) => s.split(' '));
const T = ev.length;
const key = (a, b) => (a < b ? `${a} ${b}` : `${b} ${a}`);

// 1. 每條邊的存活區間
const open = new Map(), spans = [];
ev.forEach(([op, a, b], t) => {
  const k = key(a, b);
  if (op === '+' && !open.has(k)) open.set(k, t);
  else if (op === '-' && open.has(k)) { spans.push([k, open.get(k), t - 1]); open.delete(k); }
});
for (const [k, l] of open) spans.push([k, l, T - 1]);

// 2. 掛到時間線段樹上
const seg = {};
function insert(o, l, r, ql, qr, e) {
  if (qr < l || r < ql || ql > qr) return;
  if (ql <= l && r <= qr) { (seg[o] ??= []).push(e); return; }
  const m = (l + r) >> 1;
  insert(2 * o, l, m, ql, qr, e);
  insert(2 * o + 1, m + 1, r, ql, qr, e);
}
for (const [k, l, r] of spans) insert(1, 0, T - 1, l, r, k.split(' '));

// 3. DFS 線段樹 + 可回滾並查集（依大小合併、不壓縮路徑）
const parent = {}, size = {}, hist = [], answers = {};
const find = (x) => { if (!(x in parent)) { parent[x] = x; size[x] = 1; } while (parent[x] !== x) x = parent[x]; return x; };
function dfs(o, l, r) {
  const before = hist.length;
  for (const [a, b] of seg[o] ?? []) {
    let ra = find(a), rb = find(b);
    if (ra === rb) continue;
    if (size[ra] > size[rb]) [ra, rb] = [rb, ra];
    parent[ra] = rb; size[rb] += size[ra];
    hist.push([ra, rb]);
  }
  if (l === r) { if (ev[l][0] === '?') answers[l] = find(ev[l][1]) === find(ev[l][2]); }
  else { const m = (l + r) >> 1; dfs(2 * o, l, m); dfs(2 * o + 1, m + 1, r); }
  while (hist.length > before) { const [ra, rb] = hist.pop(); parent[ra] = ra; size[rb] -= size[ra]; }
}

dfs(1, 0, T - 1);
for (const t of Object.keys(answers).map(Number).sort((x, y) => x - y)) console.log(`t=${t} ? ${ev[t][1]} ${ev[t][2]}: ${answers[t] ? 'connected' : 'not connected'}`);
