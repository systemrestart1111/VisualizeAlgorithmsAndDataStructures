const EDGES = [[1, 2], [2, 3], [3, 4], [4, 5], [5, 1], [3, 6], [6, 7], [7, 8], [8, 9], [9, 6], [5, 10]];
const n = 10;
const adj = Array.from({ length: n }, () => []);
for (const [a, b] of EDGES) { adj[a - 1].push(b - 1); adj[b - 1].push(a - 1); }
const match = new Array(n).fill(-1);

// BFS 交替樹；遇到奇環就把它收縮到共同的 base，找到未匹配點就沿路翻轉
function augmentFrom(root) {
  const p = new Array(n).fill(-1), base = [...Array(n).keys()], used = new Array(n).fill(false);
  used[root] = true;
  const q = [root];
  const lca = (a, b) => {
    const seen = new Array(n).fill(false);
    for (;;) { a = base[a]; seen[a] = true; if (match[a] < 0) break; a = p[match[a]]; }
    for (;;) { b = base[b]; if (seen[b]) return b; b = p[match[b]]; }
  };
  const mark = (v, b, child, blossom) => {
    while (base[v] !== b) { blossom[base[v]] = blossom[base[match[v]]] = true; p[v] = child; child = match[v]; v = p[match[v]]; }
  };
  for (let h = 0; h < q.length; h++) {
    const v = q[h];
    for (let u of adj[v]) {
      if (base[v] === base[u] || match[v] === u) continue;
      if (u === root || (match[u] >= 0 && p[match[u]] >= 0)) {
        const cb = lca(v, u), blossom = new Array(n).fill(false);
        mark(v, cb, u, blossom);
        mark(u, cb, v, blossom);
        for (let i = 0; i < n; i++) if (blossom[base[i]]) { base[i] = cb; if (!used[i]) { used[i] = true; q.push(i); } }
      } else if (p[u] < 0) {
        p[u] = v;
        if (match[u] < 0) {
          while (u >= 0) { const pv = p[u], nxt = match[pv]; match[u] = pv; match[pv] = u; u = nxt; }
          return true;
        }
        used[match[u]] = true;
        q.push(match[u]);
      }
    }
  }
  return false;
}

let size = 0;
for (let r = 0; r < n; r++) if (match[r] < 0 && augmentFrom(r)) size++;
const pairs = match.map((m, i) => [i, m]).filter(([i, m]) => m > i);
const isEdge = (a, b) => EDGES.some(([x, y]) => (x - 1 === a && y - 1 === b) || (x - 1 === b && y - 1 === a));
const valid = pairs.every(([a, b]) => isEdge(a, b)) && new Set(pairs.flat()).size === 2 * pairs.length;
const memo = new Map();
function brute(mask) {
  if (memo.has(mask)) return memo.get(mask);
  let i = 0;
  while (i < n && (mask >> i) & 1) i++;
  if (i === n) return 0;
  let res = brute(mask | (1 << i));
  for (const u of adj[i]) if (!((mask >> u) & 1)) res = Math.max(res, 1 + brute(mask | (1 << i) | (1 << u)));
  memo.set(mask, res);
  return res;
}
console.log(`maximum matching: ${size} | brute force: ${brute(0)} | valid: ${valid ? 'True' : 'False'}`);
