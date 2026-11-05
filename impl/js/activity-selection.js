const IV = [[1, 4], [3, 5], [0, 6], [5, 7], [3, 9], [5, 9], [6, 10], [8, 11], [8, 12], [2, 14], [12, 16]];

// 依結束時間排序，每次選最早結束、且不與已選區間重疊的活動
const chosen = [];
let end = -Infinity;
for (const [s, e] of [...IV].sort((a, b) => a[1] - b[1])) if (s >= end) { chosen.push([s, e]); end = e; }
console.log('selected:', chosen.map(([s, e]) => `[${s},${e})`).join(' '));
console.log('count =', chosen.length);
