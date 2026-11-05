const IV = [[0, 3], [1, 4], [2, 6], [4, 7], [5, 9], [6, 8], [7, 10], [9, 12], [8, 11], [11, 13]];

// 依開始時間處理；記錄每間教室的結束時間，最早空出的教室若來得及就沿用，否則開新教室
const roomEnd = [];
for (const [s, e] of [...IV].sort((a, b) => a[0] - b[0] || a[1] - b[1])) {
  let best = -1; // (結束時間, 編號) 最小的教室，相當於堆積頂端
  roomEnd.forEach((t, r) => { if (best < 0 || t < roomEnd[best]) best = r; });
  const r = best >= 0 && roomEnd[best] <= s ? best : roomEnd.length;
  roomEnd[r] = e;
  console.log(`[${s},${e}) -> room ${r}`);
}
console.log('rooms needed =', roomEnd.length);
