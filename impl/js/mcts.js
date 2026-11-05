const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
let state = 42;
// Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1
const randInt = (k) => (state = (state * 48271) % 2147483647) % k;

function winner(b) {
  for (const [a, c, d] of LINES) if (b[a] !== '.' && b[a] === b[c] && b[c] === b[d]) return b[a];
  return b.includes('.') ? null : 'draw';
}
const play = (b, i, p) => b.slice(0, i) + p + b.slice(i + 1);
function makeNode(board, justMoved, move, parent) {
  const untried = winner(board) ? [] : [...board].map((ch, i) => (ch === '.' ? i : -1)).filter((i) => i >= 0);
  return { board, justMoved, move, parent, children: [], untried, wins: 0, visits: 0 };
}

// 選擇（UCT）→ 擴展 → 隨機模擬到終局 → 把勝負沿路徑往回更新
function mcts(board, iters) {
  const xs = [...board].filter((c) => c === 'X').length, os = [...board].filter((c) => c === 'O').length;
  const toMove = xs > os ? 'O' : 'X';
  const root = makeNode(board, toMove === 'O' ? 'X' : 'O', null, null);
  for (let it = 0; it < iters; it++) {
    let node = root;
    while (!node.untried.length && node.children.length) { // 1. 選擇：UCB = 勝率 + 1.4·√(ln N / n)
      let best = null, bestV = -1;
      for (const c of node.children) {
        const v = c.wins / c.visits + 1.4 * Math.sqrt(Math.log(node.visits) / c.visits);
        if (v > bestV + 1e-12) { best = c; bestV = v; } // 容許誤差：平手時固定選先展開的子節點
      }
      node = best;
    }
    if (node.untried.length) { // 2. 擴展
      const m = node.untried.splice(randInt(node.untried.length), 1)[0];
      const p = node.justMoved === 'X' ? 'O' : 'X';
      const child = makeNode(play(node.board, m, p), p, m, node);
      node.children.push(child);
      node = child;
    }
    let b = node.board, p = node.justMoved; // 3. 隨機模擬
    while (winner(b) === null) {
      p = p === 'X' ? 'O' : 'X';
      const empty = [...b].map((ch, i) => (ch === '.' ? i : -1)).filter((i) => i >= 0);
      b = play(b, empty[randInt(empty.length)], p);
    }
    const w = winner(b);
    for (; node; node = node.parent) { // 4. 反向傳播：從「剛走這步的玩家」角度記錄勝負
      node.visits++;
      node.wins += w === node.justMoved ? 1 : w === 'draw' ? 0.5 : 0;
    }
  }
  return [toMove, root];
}

const [toMove, root] = mcts('X.O.X....', 300);
console.log('player to move:', toMove);
const kids = [...root.children].sort((a, b) => a.move - b.move);
for (const c of kids) console.log(`move ${c.move}: visits ${c.visits}, wins ${c.wins.toFixed(1)}`);
console.log('best move =', kids.reduce((b, c) => (c.visits > b.visits ? c : b)).move);
