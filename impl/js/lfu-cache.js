// 依使用次數分桶，每桶是一條 LRU（Set 保留插入順序：前面最久未用）；追蹤 minFreq
class LFUCache {
  constructor(cap) { this.cap = cap; this.val = new Map(); this.freq = new Map(); this.buckets = new Map(); this.minFreq = 0; }
  bucket(f) { if (!this.buckets.has(f)) this.buckets.set(f, new Set()); return this.buckets.get(f); }
  touch(k) {
    const f = this.freq.get(k);
    this.bucket(f).delete(k);
    if (!this.bucket(f).size && this.minFreq === f) this.minFreq++;
    this.freq.set(k, f + 1);
    this.bucket(f + 1).add(k);
  }
  get(k) {
    if (!this.val.has(k)) return -1;
    this.touch(k);
    return this.val.get(k);
  }
  put(k, v) {
    if (this.cap <= 0) return;
    if (this.val.has(k)) { this.val.set(k, v); this.touch(k); return; }
    if (this.val.size >= this.cap) {
      const old = this.bucket(this.minFreq).values().next().value;
      this.bucket(this.minFreq).delete(old);
      this.val.delete(old); this.freq.delete(old);
    }
    this.val.set(k, v); this.freq.set(k, 1);
    this.bucket(1).add(k);
    this.minFreq = 1;
  }
}

const c = new LFUCache(2);
c.put(1, 1); c.put(2, 2);
console.log('get 1 ->', c.get(1));
c.put(3, 3);
const a = c.get(2), b = c.get(3);
console.log('get 2 ->', a, '| get 3 ->', b);
c.put(4, 4);
const x = c.get(1), y = c.get(3), z = c.get(4);
console.log('get 1 ->', x, '| get 3 ->', y, '| get 4 ->', z);
console.log('freq:', [...c.freq].sort((p, q) => p[0] - q[0]).map(([k, f]) => `${k}:${f}`).join(' '));
