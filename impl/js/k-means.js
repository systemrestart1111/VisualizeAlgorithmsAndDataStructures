const PTS = [[1, 2], [2, 1], [2, 3], [3, 2], [7, 8], [8, 7], [8, 9], [9, 8], [1, 8], [2, 7], [2, 9], [3, 8]], K = 3;

// Lloyd 演算法：重複「每點分給最近的中心」與「中心移到所屬點的平均位置」，直到分群不再改變
// （這裡用前 k 個點當初始中心，方便重現。這組資料的前 3 點都在同一群，結果會卡在局部最佳解（左下群被拆成兩半），可看出初始化的影響；實務上常用 k-means++ 改善）
let cent = PTS.slice(0, K).map((p) => [...p]);
let assign = new Array(PTS.length).fill(-1);
for (let it = 1; it <= 20; it++) {
  const nw = PTS.map(([x, y]) => {
    let best = 0, bd = Infinity;
    cent.forEach(([cx, cy], c) => {
      const d = (x - cx) ** 2 + (y - cy) ** 2;
      if (d < bd - 1e-9) { best = c; bd = d; } // 容許誤差：距離相同時固定選編號小的中心
    });
    return best;
  });
  if (nw.every((v, i) => v === assign[i])) break;
  assign = nw;
  cent = cent.map((old, c) => {
    const members = PTS.filter((_, i) => assign[i] === c);
    return members.length ? [members.reduce((s, p) => s + p[0], 0) / members.length, members.reduce((s, p) => s + p[1], 0) / members.length] : old;
  });
  console.log(`iteration ${it}:`, cent.map(([cx, cy]) => `(${cx.toFixed(4)}, ${cy.toFixed(4)})`).join(' '));
}
console.log('labels:', assign.join(' '));
