const MEN = { A: 'XYZW', B: 'YXWZ', C: 'XZYW', D: 'ZWXY' };    // 求婚方的偏好（由高到低）
const WOMEN = { X: 'BADC', Y: 'ACBD', Z: 'CDAB', W: 'DBCA' };  // 被求婚方的偏好
const rank = Object.fromEntries(Object.entries(WOMEN).map(([w, p]) => [w, Object.fromEntries([...p].map((m, i) => [m, i]))]));

// 自由的求婚者依序向下一個還沒求過的對象求婚；對方若更喜歡他就換掉現任
const free = Object.keys(MEN), nxt = {}, partner = {}; // partner：被求婚方 -> 求婚方
for (let h = 0; h < free.length; h++) {
  const m = free[h];
  nxt[m] ??= 0;
  const w = MEN[m][nxt[m]++];
  if (!(w in partner)) {
    partner[w] = m;
    console.log(`${m} proposes ${w}: accepted`);
  } else if (rank[w][m] < rank[w][partner[w]]) {
    console.log(`${m} proposes ${w}: accepted, ${partner[w]} is free again`);
    free.push(partner[w]);
    partner[w] = m;
  } else {
    console.log(`${m} proposes ${w}: rejected`);
    free.push(m);
  }
}
console.log('stable matching:', Object.entries(partner).sort((a, b) => (a[1] < b[1] ? -1 : 1)).map(([w, m]) => `${m}-${w}`).join(' '));
