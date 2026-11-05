// 與 thompson-nfa 相同：先轉後序式，再以堆疊組合片段
function thompson(re) {
  const tokens = [];
  for (let i = 0; i < re.length; i++) { tokens.push(re[i]); if (i + 1 < re.length && !'|)*+?'.includes(re[i + 1]) && re[i] !== '(' && re[i] !== '|') tokens.push('.'); }
  const prec = { '|': 1, '.': 2, '*': 3, '+': 3, '?': 3 };
  const out = [], ops = [];
  for (const t of tokens) {
    if (/[a-z0-9]/.test(t)) out.push(t);
    else if (t === '(') ops.push(t);
    else if (t === ')') { while (ops.at(-1) !== '(') out.push(ops.pop()); ops.pop(); }
    else { while (ops.length && ops.at(-1) !== '(' && prec[ops.at(-1)] >= prec[t]) out.push(ops.pop()); ops.push(t); }
  }
  const trans = [], st = [];
  let n = 0;
  for (const t of [...out, ...ops.reverse()]) {
    if (/[a-z0-9]/.test(t)) { trans.push([n, n + 1, t]); st.push([n, n + 1]); n += 2; }
    else if (t === '.') { const b = st.pop(), a = st.pop(); trans.push([a[1], b[0], null]); st.push([a[0], b[1]]); }
    else if (t === '|') { const b = st.pop(), a = st.pop(); trans.push([n, a[0], null], [n, b[0], null], [a[1], n + 1, null], [b[1], n + 1, null]); st.push([n, n + 1]); n += 2; }
    else { const a = st.pop(); trans.push([n, a[0], null], [a[1], n + 1, null]); if (t !== '+') trans.push([n, n + 1, null]); if (t !== '?') trans.push([a[1], a[0], null]); st.push([n, n + 1]); n += 2; }
  }
  return { start: st[0][0], accept: st[0][1], trans };
}
const closure = (trans, set) => { const out = new Set(set), stack = [...set]; while (stack.length) { const u = stack.pop(); for (const [a, b, c] of trans) if (a === u && c === null && !out.has(b)) { out.add(b); stack.push(b); } } return [...out].sort((x, y) => x - y); };
const move = (trans, set, ch) => [...new Set(trans.filter(([a, , c]) => set.includes(a) && c === ch).map(([, b]) => b))];

for (const re of ['(a|b)*abb', 'a(b|c)*', '(ab)+c?']) {
  const { start, accept, trans } = thompson(re);
  const alpha = [...new Set(trans.filter(([, , c]) => c).map(([, , c]) => c))].sort();
  // DFA 狀態 = NFA 狀態集合；BFS 取 move 後的 ε-closure
  const states = [closure(trans, [start])], table = [{}];
  for (let i = 0; i < states.length; i++)
    for (const c of alpha) {
      const mv = move(trans, states[i], c);
      if (!mv.length) continue;
      const t = closure(trans, mv);
      let j = states.findIndex((s) => s.join() === t.join());
      if (j < 0) { j = states.length; states.push(t); table.push({}); }
      table[i][c] = j;
    }
  const nacc = states.filter((s) => s.includes(accept)).length;
  // 以所有長度 ≤ 5 的字串比對 NFA 與 DFA
  const words = [''];
  for (let L = 1; L <= 5; L++) for (const w of words.filter((x) => x.length === L - 1)) for (const c of alpha) words.push(w + c);
  let agree = 0;
  for (const w of words) {
    let cur = closure(trans, [start]), s = 0, dead = false;
    for (const ch of w) { cur = closure(trans, move(trans, cur, ch)); if (!dead) { if (ch in table[s]) s = table[s][ch]; else dead = true; } }
    if (cur.includes(accept) === (!dead && states[s].includes(accept))) agree++;
  }
  console.log(`${re}: DFA states ${states.length}, accepting ${nacc}, agree on ${agree}/${words.length} strings`);
}
