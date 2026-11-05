// 插入隱含的連接符號「.」後，用 Shunting-yard 轉成後序式
function toPostfix(re) {
  const tokens = [];
  for (let i = 0; i < re.length; i++) {
    tokens.push(re[i]);
    if (i + 1 < re.length && !'|)*+?'.includes(re[i + 1]) && re[i] !== '(' && re[i] !== '|') tokens.push('.');
  }
  const prec = { '|': 1, '.': 2, '*': 3, '+': 3, '?': 3 };
  const out = [], ops = [];
  for (const t of tokens) {
    if (/[a-z0-9]/.test(t)) out.push(t);
    else if (t === '(') ops.push(t);
    else if (t === ')') { while (ops.at(-1) !== '(') out.push(ops.pop()); ops.pop(); }
    else { while (ops.length && ops.at(-1) !== '(' && prec[ops.at(-1)] >= prec[t]) out.push(ops.pop()); ops.push(t); }
  }
  return [...out, ...ops.reverse()];
}
// 每個片段有一個起點與一個接受狀態
function thompson(re) {
  const trans = [], st = [];
  let n = 0;
  for (const t of toPostfix(re)) {
    if (/[a-z0-9]/.test(t)) { const s = n++, a = n++; trans.push([s, a, t]); st.push([s, a]); }
    else if (t === '.') { const b = st.pop(), a = st.pop(); trans.push([a[1], b[0], null]); st.push([a[0], b[1]]); }
    else if (t === '|') { const b = st.pop(), a = st.pop(), s = n++, e = n++; trans.push([s, a[0], null], [s, b[0], null], [a[1], e, null], [b[1], e, null]); st.push([s, e]); }
    else {
      const a = st.pop(), s = n++, e = n++;
      trans.push([s, a[0], null], [a[1], e, null]);
      if (t !== '+') trans.push([s, e, null]);
      if (t !== '?') trans.push([a[1], a[0], null]);
      st.push([s, e]);
    }
  }
  const [start, accept] = st.pop();
  return { start, accept, n, trans };
}
function closure(m, set) {
  const out = new Set(set), stack = [...set];
  while (stack.length) { const u = stack.pop(); for (const [a, b, c] of m.trans) if (a === u && c === null && !out.has(b)) { out.add(b); stack.push(b); } }
  return out;
}
function accepts(m, w) {
  let cur = closure(m, [m.start]);
  for (const ch of w) cur = closure(m, m.trans.filter(([a, , c]) => cur.has(a) && c === ch).map(([, b]) => b));
  return cur.has(m.accept);
}

for (const [re, tests] of [['(a|b)*abb', ['abb', 'aabb', 'babb', 'ab', '', 'abab']], ['a(b|c)*', ['a', 'abcb', 'b', 'ac']], ['(ab)+c?', ['ab', 'ababc', 'c', 'abcc']]]) {
  const m = thompson(re);
  console.log(`${re}: ${m.n} states, ${m.trans.length} transitions;`, tests.map((w) => `${w || 'ε'}=${accepts(m, w) ? 'Y' : 'N'}`).join(' '));
}
