// 重量以「乘上 100 的整數」表示，避免浮點數誤差（3.14 -> 314）
const ITEMS = [[200, 40], [314, 50], [198, 100], [500, 95], [300, 30]]; // (重量 x100, 價值)
const W = 1000;
const order = ITEMS.map((_, i) => i).sort((a, b) => ITEMS[b][1] / ITEMS[b][0] - ITEMS[a][1] / ITEMS[a][0]);
let best = 0, bestSet = [], nodes = 0;

// 上界：剩下的物品依單位價值貪婪裝入，最後一件可以只裝一部分（分數背包的解一定不比整數解差）
function bound(k, cap, value) {
  for (const i of order.slice(k)) {
    const [w, v] = ITEMS[i];
    if (w <= cap) { cap -= w; value += v; }
    else return value + (v * cap) / w;
  }
  return value;
}

// 分支：第 k 件拿或不拿；限界：上界不超過目前最佳解就剪掉整棵子樹
function dfs(k, cap, value, chosen) {
  nodes++;
  if (value > best) { best = value; bestSet = [...chosen]; }
  if (k === order.length || bound(k, cap, value) <= best + 1e-9) return;
  const i = order[k];
  if (ITEMS[i][0] <= cap) {
    chosen.push(i);
    dfs(k + 1, cap - ITEMS[i][0], value + ITEMS[i][1], chosen);
    chosen.pop();
  }
  dfs(k + 1, cap, value, chosen);
}

dfs(0, W, 0, []);
console.log('best value =', best);
console.log('items:', bestSet.sort((a, b) => a - b).map((i) => `I${i}`).join(' '));
console.log('nodes explored =', nodes);
