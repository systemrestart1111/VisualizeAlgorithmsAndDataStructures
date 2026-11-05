const EMPTY = null, DELETED = 'DEL';

// 所有鍵都放在同一個陣列；碰撞時線性探測下一格。刪除要留「墓碑」，否則會截斷後面鍵的探測路徑
class OpenAddressingTable {
  constructor(m = 11) { this.slots = new Array(m).fill(EMPTY); }
  insert(k) {
    const m = this.slots.length;
    let firstTomb = -1;
    for (let i = 0; i < m; i++) {
      const idx = (k + i) % m, s = this.slots[idx];
      if (s === k) return idx; // 已存在
      if (s === DELETED && firstTomb < 0) firstTomb = idx; // 先記下來，繼續往後確認 k 不存在
      if (s === EMPTY) {
        const target = firstTomb >= 0 ? firstTomb : idx;
        this.slots[target] = k;
        return target;
      }
    }
    if (firstTomb >= 0) { this.slots[firstTomb] = k; return firstTomb; }
    throw new Error('table is full');
  }
  search(k) {
    const m = this.slots.length;
    let probes = 0;
    for (let i = 0; i < m; i++) {
      const idx = (k + i) % m;
      probes++;
      if (this.slots[idx] === EMPTY) return [-1, probes];
      if (this.slots[idx] === k) return [idx, probes];
    }
    return [-1, probes];
  }
  delete(k) {
    const [idx] = this.search(k);
    if (idx >= 0) this.slots[idx] = DELETED;
    return idx >= 0;
  }
  toString() { return this.slots.map((s) => (s === EMPTY ? '.' : s === DELETED ? 'X' : s)).join(' '); }
}

const t = new OpenAddressingTable();
for (const k of [22, 1, 13, 11, 24, 33, 18]) {
  const s = t.insert(k);
  console.log(`insert ${String(k).padStart(2)} -> slot ${String(s).padStart(2)}   [${t}]`);
}
let r = t.search(33);
console.log(`search 33 -> (slot, probes) = (${r[0]}, ${r[1]})`);
console.log(`delete 13 -> ${t.delete(13) ? 'True' : 'False'}   [${t}]`);
r = t.search(24);
console.log(`search 24 -> (slot, probes) = (${r[0]}, ${r[1]}) (passes the tombstone)`);
const s = t.insert(35);
console.log(`insert 35 -> slot ${String(s).padStart(2)}   [${t}] (reuses the tombstone)`);
