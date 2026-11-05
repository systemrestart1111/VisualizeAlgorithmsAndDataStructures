const TASKS = [['A', 3, []], ['B', 2, ['A']], ['C', 4, ['A']], ['D', 2, ['B']], ['E', 2, ['C']], ['F', 3, ['D', 'E']], ['G', 4, []], ['H', 1, ['G']]];

// 正向算 ES/EF、反向算 LS/LF；浮時 0 為關鍵工作（工作依前置先後列出）
const ES = {}, EF = {}, LS = {}, LF = {};
for (const [n, d, p] of TASKS) { ES[n] = Math.max(0, ...p.map((x) => EF[x])); EF[n] = ES[n] + d; }
const T = Math.max(...Object.values(EF));
for (const [n, d] of [...TASKS].reverse()) {
  const succ = TASKS.filter(([, , p]) => p.includes(n)).map(([m]) => m);
  LF[n] = Math.min(T, ...succ.map((m) => LS[m]));
  LS[n] = LF[n] - d;
}
console.log('project duration:', T);
console.log('task dur ES EF LS LF slack');
const pad = (x, w) => String(x).padStart(w);
for (const [n, d] of TASKS) console.log(`${pad(n, 4)} ${pad(d, 3)} ${pad(ES[n], 2)} ${pad(EF[n], 2)} ${pad(LS[n], 2)} ${pad(LF[n], 2)} ${pad(LS[n] - ES[n], 5)}`);
console.log('critical:', TASKS.filter(([n]) => LS[n] === ES[n]).map(([n]) => n).join(' '));
