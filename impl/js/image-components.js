const N = 16;
const N4 = [[-1, 0], [0, -1], [0, 1], [1, 0]];
const N8 = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const blobs = () => Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => ((r - 5.5) ** 2 + (c - 5) ** 2 <= 16 || (r - 9) ** 2 + (c - 10.5) ** 2 <= 16 || (r - 13) ** 2 + (c - 2.5) ** 2 <= 3.5 ? 1 : 0)));
function noisyBin() {
  const a = blobs();
  let s = 5;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { s = (s * 48271) % 2147483647; if (s % 100 < 6) a[r][c] = 1 - a[r][c]; }
  return a;
}
const diag = () => Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (((r + c) % 4 === 0 && r % 2 === 0) || (r >= 10 && c >= 10 && (r + c) % 2 === 0) ? 1 : 0)));

// 第一趟看已掃過的鄰居，給新標籤或用並查集合併；第二趟換成代表並重新編號
function twoPass(A, conn) {
  const prev = conn === 8 ? [[-1, -1], [-1, 0], [-1, 1], [0, -1]] : [[-1, 0], [0, -1]];
  const lab = A.map((row) => row.map(() => 0));
  const parent = [0];
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      if (!A[r][c]) continue;
      const nbr = prev.map(([dr, dc]) => (r + dr >= 0 && r + dr < N && c + dc >= 0 && c + dc < N ? lab[r + dr][c + dc] : 0)).filter((v) => v);
      if (!nbr.length) { parent.push(parent.length); lab[r][c] = parent.length - 1; continue; }
      lab[r][c] = Math.min(...nbr);
      for (const v of nbr) { const a = find(v), b = find(lab[r][c]); if (a !== b) parent[Math.max(a, b)] = Math.min(a, b); }
    }
  const remap = new Map();
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (lab[r][c]) { const root = find(lab[r][c]); if (!remap.has(root)) remap.set(root, remap.size + 1); lab[r][c] = remap.get(root); }
  return { lab, n: remap.size, provisional: parent.length - 1 };
}
function bfs(A, conn) {
  const nb = conn === 8 ? N8 : N4, lab = A.map((row) => row.map(() => 0));
  let n = 0;
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      if (!A[r][c] || lab[r][c]) continue;
      lab[r][c] = ++n;
      const q = [[r, c]];
      for (let qi = 0; qi < q.length; qi++) {
        const [y, x] = q[qi];
        for (const [dy, dx] of nb) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < N && xx >= 0 && xx < N && A[yy][xx] && !lab[yy][xx]) { lab[yy][xx] = n; q.push([yy, xx]); } }
      }
    }
  return { lab, n };
}

for (const [name, A] of [['noisy blobs', noisyBin()], ['blobs', blobs()], ['diagonal dots', diag()]])
  for (const conn of [4, 8]) {
    const { lab, n, provisional } = twoPass(A, conn), b = bfs(A, conn);
    const pairs = new Set();
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (A[r][c]) pairs.add(`${lab[r][c]}-${b.lab[r][c]}`);
    const sizes = Array.from({ length: n }, (_, k) => lab.flat().filter((v) => v === k + 1).length).sort((x, y) => y - x);
    console.log(`${name}, ${conn}-connected: ${n} components (${provisional} provisional labels), sizes [${sizes.join(', ')}], matches BFS ${n === b.n && pairs.size === n ? 'True' : 'False'}`);
  }
