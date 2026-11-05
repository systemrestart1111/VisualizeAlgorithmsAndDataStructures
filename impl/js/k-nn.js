const TRAIN = [[2, 3, 0], [3, 5, 0], [4, 2, 0], [1, 6, 0], [5, 4, 0], [3, 3, 0], [8, 8, 1], [9, 6, 1],
               [7, 9, 1], [10, 8, 1], [8, 6, 1], [6, 7, 1], [5, 9, 2], [3, 9, 2], [4, 10, 2], [2, 8, 2]];
const QUERY = [6, 5], K = 5;
const d2 = (i) => (TRAIN[i][0] - QUERY[0]) ** 2 + (TRAIN[i][1] - QUERY[1]) ** 2;

// 找出離查詢點最近的 k 筆訓練資料，以多數決決定類別（票數相同時取編號小的類別）
const order = TRAIN.map((_, i) => i).sort((a, b) => d2(a) - d2(b) || a - b);
const votes = {};
for (const i of order.slice(0, K)) {
  const [x, y, c] = TRAIN[i];
  console.log(`neighbor (${x},${y}) class ${c}, d^2 = ${d2(i)}`);
  votes[c] = (votes[c] ?? 0) + 1;
}
const classes = Object.keys(votes).map(Number).sort((a, b) => a - b);
const pred = classes.reduce((best, c) => (votes[c] > votes[best] ? c : best), classes[0]);
console.log('votes:', classes.map((c) => `class ${c}=${votes[c]}`).join(' '));
console.log('predicted class =', pred);
