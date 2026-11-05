const fmt = (v) => (Math.abs(v) < 5e-7 ? 0 : v).toFixed(6);

// 化成簡化列梯形 (RREF)，判斷唯一解／無解／無限多解
function gaussJordan(src) {
  const M = src.map((r) => [...r]);
  const R = M.length, nv = M[0].length - 1, piv = [];
  let row = 0;
  for (let col = 0; col < nv && row < R; col++) {
    let p = row;
    for (let i = row + 1; i < R; i++) if (Math.abs(M[i][col]) > Math.abs(M[p][col])) p = i;
    if (Math.abs(M[p][col]) < 1e-9) continue; // 沒有主元：自由變數
    [M[p], M[row]] = [M[row], M[p]];
    const pv = M[row][col];
    M[row] = M[row].map((v) => v / pv);
    for (let i = 0; i < R; i++)
      if (i !== row && Math.abs(M[i][col]) > 1e-12) { const f = M[i][col]; M[i] = M[i].map((v, j) => v - f * M[row][j]); }
    piv.push(col);
    row++;
  }
  for (let i = row; i < R; i++) if (Math.abs(M[i][nv]) > 1e-9) return 'no solution (row 0 ... 0 | c with c != 0)';
  if (piv.length < nv) {
    const free = [...Array(nv).keys()].filter((j) => !piv.includes(j)).map((j) => ` x${j + 1}`).join('');
    return `infinitely many: rank ${piv.length} < ${nv}, free${free}`;
  }
  return 'unique:' + M.slice(0, nv).map((r, i) => ` x${i + 1} = ${fmt(r[nv])}`).join('');
}

for (const s of [
  [[2, 1, -1, 8], [-3, -1, 2, -11], [-2, 1, 2, -3]],
  [[1, 2, -1, 3], [2, 4, -2, 6], [1, 1, 1, 4]],
  [[1, 1, 2, 3], [2, 2, 4, 7], [1, -1, 0, 1]],
  [[0, 2, 4], [3, 1, 5]],
]) console.log(gaussJordan(s));
