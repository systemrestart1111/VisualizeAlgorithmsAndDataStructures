// 差分陣列：區間 [l, r] 加 v 只需 d[l] += v、d[r+1] -= v，最後做一次前綴和還原
function applyUpdates(a, ops) {
  const d = new Array(a.length + 1).fill(0);
  for (const [l, r, v] of ops) {
    d[l] += v;
    d[r + 1] -= v;
  }
  let run = 0;
  for (let i = 0; i < a.length; i++) {
    run += d[i];
    a[i] += run;
  }
  return a;
}

const a = new Array(10).fill(5);
console.log(applyUpdates(a, [[1, 4, 3], [3, 7, 2], [0, 2, -1], [6, 9, 5]]).join(' '));
