// 逐列放皇后；用三個集合記錄被佔用的欄與兩條對角線，衝突就換下一欄（回溯）
function solveNQueens(n) {
  const cols = new Set(), d1 = new Set(), d2 = new Set(), pos = [], sols = [];
  (function bt(r) {
    if (r === n) { sols.push([...pos]); return; }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) continue;
      cols.add(c); d1.add(r - c); d2.add(r + c); pos.push(c);
      bt(r + 1);
      cols.delete(c); d1.delete(r - c); d2.delete(r + c); pos.pop();
    }
  })(0);
  return sols;
}

const sols = solveNQueens(6);
console.log('solutions =', sols.length);
for (const c of sols[0]) console.log(Array.from({ length: 6 }, (_, i) => (i === c ? 'Q' : '.')).join(' '));
