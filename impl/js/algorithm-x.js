const SETS = { A: [1, 4, 7], B: [1, 4], C: [4, 5, 7], D: [3, 5, 6], E: [2, 3, 6, 7], F: [2, 7] };
const COLS = [1, 2, 3, 4, 5, 6, 7], names = Object.keys(SETS);
const active = Object.fromEntries(names.map((r) => [r, true])), covered = {};
const solutions = [];

// Knuth 的 Algorithm X：挑候選最少的欄，逐一嘗試涵蓋它的列；選了某列就移除它的所有欄與衝突的列，失敗再還原
// （舞蹈鏈 Dancing Links 是用雙向環狀鏈結串列讓「移除／還原」變成 O(1) 的實作方式，搜尋邏輯相同）
function search(sol) {
  const open = COLS.filter((c) => !covered[c]);
  if (!open.length) { solutions.push([...sol].sort()); return; }
  const cand = (c) => names.filter((r) => active[r] && SETS[r].includes(c));
  let col = open[0];
  for (const c of open) if (cand(c).length < cand(col).length) col = c; // 同數量時取編號小的欄
  for (const r of cand(col)) {
    sol.push(r);
    const removed = names.filter((r2) => active[r2] && SETS[r2].some((c) => SETS[r].includes(c)));
    for (const c of SETS[r]) covered[c] = true;
    for (const r2 of removed) active[r2] = false;
    search(sol);
    for (const r2 of removed) active[r2] = true; // 還原
    for (const c of SETS[r]) covered[c] = false;
    sol.pop();
  }
}

search([]);
for (const s of solutions) console.log(`solution: {${s.join(' ')}}`);
console.log('total solutions =', solutions.length);
