const neg = (x) => (x.startsWith('!') ? x.slice(1) : '!' + x);

// (a ∨ b) ⇔ ¬a → b 且 ¬b → a；Tarjan 求 SCC，x 與 ¬x 同分量則無解
function twoSat(clauses) {
  const vs = [...new Set(clauses.flat().map((x) => x.replace('!', '')))].sort();
  const nodes = vs.flatMap((v) => [v, '!' + v]);
  const adj = Object.fromEntries(nodes.map((x) => [x, []]));
  for (const [a, b] of clauses) { adj[neg(a)].push(b); adj[neg(b)].push(a); }
  for (const x in adj) adj[x].sort();
  const idx = {}, low = {}, comp = {}, st = [], on = new Set();
  let t = 0, c = 0;
  const dfs = (u) => {
    idx[u] = low[u] = t++;
    st.push(u); on.add(u);
    for (const v of adj[u]) {
      if (!(v in idx)) { dfs(v); low[u] = Math.min(low[u], low[v]); }
      else if (on.has(v)) low[u] = Math.min(low[u], idx[v]);
    }
    if (low[u] === idx[u]) { let x; do { x = st.pop(); on.delete(x); comp[x] = c; } while (x !== u); c++; }
  };
  for (const u of nodes) if (!(u in idx)) dfs(u);
  if (vs.some((v) => comp[v] === comp['!' + v])) return null;
  return Object.fromEntries(vs.map((v) => [v, comp[v] < comp['!' + v]])); // Tarjan 的分量編號是反拓撲序
}

for (const text of ['a|b; !a|c; !b|!c; c|d; !d|!a', 'a|b; a|!b; !a|b; !a|!b', 'x|y; !x|y; !y|z']) {
  const cl = text.split(';').map((p) => p.trim().split('|'));
  const res = twoSat(cl);
  if (!res) { console.log(text, '=> unsatisfiable'); continue; }
  const holds = (x) => (x.startsWith('!') ? !res[x.slice(1)] : res[x]);
  const ok = cl.every(([a, b]) => holds(a) || holds(b));
  console.log(text, '=>', Object.entries(res).map(([v, b]) => `${v}=${b ? 'T' : 'F'}`).join(' '), '| verified', ok ? 'True' : 'False');
}
