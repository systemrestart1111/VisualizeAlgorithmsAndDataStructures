const PTS = [[2.1, 3.0], [2.8, 2.4], [3.4, 3.6], [2.5, 4.1], [3.9, 2.7], [1.8, 2.2], [3.0, 3.1], [2.2, 3.8],
  [7.0, 7.4], [7.8, 6.6], [8.3, 7.9], [6.9, 6.4], [7.5, 8.2], [8.6, 6.9], [7.2, 7.0],
  [6.6, 2.1], [7.4, 2.9], [7.9, 2.2], [6.9, 3.2],
  [5.0, 5.2], [0.5, 9.0], [9.5, 0.6], [4.6, 8.8]];

// N(p) 含 p 自己；|N(p)| ≥ minPts 為核心點；從核心點 BFS 擴張，其餘為雜訊
function dbscan(P, eps, minPts) {
  const nb = P.map((p) => P.map((q, j) => ((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 <= eps * eps ? j : -1)).filter((j) => j >= 0));
  const core = nb.map((s) => s.length >= minPts);
  const lab = new Array(P.length).fill(-1);
  let c = -1;
  for (let i = 0; i < P.length; i++) {
    if (lab[i] >= 0 || !core[i]) continue;
    lab[i] = ++c;
    const q = [i];
    for (let k = 0; k < q.length; k++) for (const j of nb[q[k]]) if (lab[j] < 0) { lab[j] = c; if (core[j]) q.push(j); }
  }
  return { lab, core, k: c + 1 };
}

for (const [eps, mp] of [[1.2, 4], [0.8, 4], [2.0, 4], [1.2, 3], [1.2, 6]]) {
  const { lab, core, k } = dbscan(PTS, eps, mp);
  const border = lab.filter((v, i) => v >= 0 && !core[i]).length;
  console.log(`eps ${eps.toFixed(1)}, minPts ${mp}: ${k} clusters, core ${core.filter(Boolean).length}, border ${border}, noise ${lab.filter((v) => v < 0).length}; labels ${lab.join(' ')}`);
}
