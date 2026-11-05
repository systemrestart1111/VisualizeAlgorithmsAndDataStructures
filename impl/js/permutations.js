// 每一層選一個還沒用過的元素放進目前位置，到底就輸出；返回時把它標回未使用（回溯）
function permutations(items) {
  const out = [], cur = [], used = new Array(items.length).fill(false);
  (function bt() {
    if (cur.length === items.length) { out.push([...cur]); return; }
    items.forEach((x, i) => {
      if (used[i]) return;
      used[i] = true;
      cur.push(x);
      bt();
      cur.pop();
      used[i] = false;
    });
  })();
  return out;
}

for (const p of permutations(['1', '2', '3'])) console.log(p.join(' '));
