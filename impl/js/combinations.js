// 從 start 開始挑下一個數，保證組合內遞增、不會重複；剩下的數不夠湊滿 k 個就剪枝
function combinations(n, k) {
  const out = [], cur = [];
  (function bt(start) {
    if (cur.length === k) { out.push([...cur]); return; }
    for (let x = start; x <= n - (k - cur.length) + 1; x++) {
      cur.push(x);
      bt(x + 1);
      cur.pop();
    }
  })(1);
  return out;
}

const res = combinations(5, 3);
for (const c of res) console.log(c.join(' '));
console.log('count =', res.length);
