// Map 會保留插入順序：刪除後重新插入即「移到最新」；第一個鍵就是最久未用
class LRUCache {
  constructor(cap) { this.cap = cap; this.map = new Map(); }
  get(k) {
    if (!this.map.has(k)) return -1;
    const v = this.map.get(k);
    this.map.delete(k);
    this.map.set(k, v);
    return v;
  }
  put(k, v) {
    if (this.cap === 0) return;
    if (this.map.has(k)) this.map.delete(k);
    else if (this.map.size === this.cap) this.map.delete(this.map.keys().next().value);
    this.map.set(k, v);
  }
  order() { return [...this.map].reverse().map(([k, v]) => `${k}:${v}`).join(' '); }
}

const c = new LRUCache(2);
c.put(1, 1); c.put(2, 2);
console.log('get 1 ->', c.get(1));
c.put(3, 3);
console.log('get 2 ->', c.get(2));
c.put(4, 4);
console.log('get 1 ->', c.get(1), '| get 3 ->', c.get(3), '| get 4 ->', c.get(4));
c.put(3, 33);
console.log('order:', c.order());
const z = new LRUCache(0);
z.put(1, 1);
console.log('cap 0 get 1 ->', z.get(1));
