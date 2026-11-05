// 並查集：路徑壓縮 + 依秩合併，單次操作均攤接近 O(1)（反阿克曼函數）
class DSU {
  constructor(n) { this.p = Array.from({ length: n }, (_, i) => i); this.rank = new Array(n).fill(0); }
  find(x) {
    let root = x;
    while (this.p[root] !== root) root = this.p[root];
    while (this.p[x] !== root) { const nx = this.p[x]; this.p[x] = root; x = nx; } // 路徑壓縮：沿路的節點都直接接到根
    return root;
  }
  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;
    if (this.rank[ra] < this.rank[rb]) [ra, rb] = [rb, ra];
    this.p[rb] = ra; // rank 較小的根接到較大的底下
    if (this.rank[ra] === this.rank[rb]) this.rank[ra]++;
    return true;
  }
  groups() {
    const g = new Map();
    for (let i = 0; i < this.p.length; i++) {
      const r = this.find(i);
      if (!g.has(r)) g.set(r, []);
      g.get(r).push(i);
    }
    return [...g.keys()].sort((a, b) => a - b).map((r) => g.get(r));
  }
}

const b = (x) => (x ? 'True' : 'False');

const d = new DSU(10);
for (const [a, c] of [[1, 2], [3, 4], [2, 4], [5, 6], [7, 8], [8, 9]]) {
  d.union(a, c);
  console.log(`union(${a}, ${c}): parent = ${d.p.join(' ')}`);
}
console.log(`find(4) = ${d.find(4)}  parent = ${d.p.join(' ')}`);
console.log(`same(1, 3) -> ${b(d.find(1) === d.find(3))}  same(1, 5) -> ${b(d.find(1) === d.find(5))}`);
console.log(`union(2, 3) -> ${b(d.union(2, 3))} (already together)`);
console.log('sets: ' + d.groups().map((g) => `{${g.join(',')}}`).join(' '));
