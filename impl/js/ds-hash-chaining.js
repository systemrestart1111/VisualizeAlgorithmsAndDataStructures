// 每個桶是一條串列，碰撞的鍵就接在同一條上；負載因子（鍵數 / 桶數）超過 1 時桶數擴為 2m+1 並重新雜湊
class ChainedHashTable {
  constructor(m = 5) { this.buckets = Array.from({ length: m }, () => []); this.count = 0; }
  rehash() {
    const old = this.buckets.flat();
    this.buckets = Array.from({ length: 2 * this.buckets.length + 1 }, () => []);
    this.count = 0;
    console.log(`  -> rehash to m = ${this.buckets.length}`);
    for (const k of old) this.insert(k);
  }
  insert(k) {
    const b = this.buckets[k % this.buckets.length];
    if (b.includes(k)) return;
    b.push(k);
    if (++this.count > this.buckets.length) this.rehash();
  }
  search(k) { return this.buckets[k % this.buckets.length].includes(k); }
  delete(k) {
    const b = this.buckets[k % this.buckets.length], i = b.indexOf(k);
    if (i < 0) return false;
    b.splice(i, 1);
    this.count--;
    return true;
  }
  show() { this.buckets.forEach((b, i) => console.log(`  [${String(i).padStart(2)}]`, b.length ? b.join(' -> ') : '-')); }
}

const h = new ChainedHashTable();
for (const k of [15, 11, 27, 8, 12, 20]) { console.log(`insert ${k}`); h.insert(k); }
h.show();
console.log(`search 27 -> ${h.search(27) ? 'True' : 'False'}  search 9 -> ${h.search(9) ? 'True' : 'False'}`);
console.log(`delete 12 -> ${h.delete(12) ? 'True' : 'False'}`);
h.show();
