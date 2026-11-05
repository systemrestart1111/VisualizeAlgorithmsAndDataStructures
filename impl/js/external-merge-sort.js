// 記憶體只能放 m 筆：先切成長度 m 的有序 run，再做 k 路合併（每次取各 run 開頭的最小值）
function externalSort(data, m) {
  const runs = [];
  for (let i = 0; i < data.length; i += m) runs.push(data.slice(i, i + m).sort((x, y) => x - y));
  runs.forEach((r, i) => console.log(`run ${i}:`, r.join(' ')));
  const pos = runs.map(() => 0), out = [];
  for (;;) {
    let best = -1;
    runs.forEach((r, i) => {
      if (pos[i] < r.length && (best < 0 || r[pos[i]] < runs[best][pos[best]])) best = i;
    });
    if (best < 0) break;
    out.push(runs[best][pos[best]++]);
  }
  return out;
}

const data = [41, 7, 63, 22, 88, 15, 34, 70, 2, 56, 29, 93, 11, 47, 80, 38, 5, 66];
console.log('merged:', externalSort(data, 4).join(' '));
