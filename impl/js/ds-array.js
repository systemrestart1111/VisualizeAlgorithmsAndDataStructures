// 固定容量的陣列：隨機存取 O(1)；在中間插入或刪除需要搬移後面的元素 O(n)
class FixedArray {
  constructor(capacity) { this.data = new Array(capacity).fill(null); this.size = 0; }
  insert(i, v) {
    if (this.size === this.data.length) throw new Error('array is full');
    for (let k = this.size; k > i; k--) this.data[k] = this.data[k - 1]; // i 之後的元素整段右移
    this.data[i] = v;
    this.size++;
  }
  delete(i) {
    const v = this.data[i];
    for (let k = i; k < this.size - 1; k++) this.data[k] = this.data[k + 1]; // i 之後的元素整段左移
    this.data[--this.size] = null;
    return v;
  }
  search(v) {
    for (let i = 0; i < this.size; i++) if (this.data[i] === v) return i;
    return -1;
  }
  toString() { return `[${this.data.slice(0, this.size).join(' ')}] size=${this.size}/${this.data.length}`; }
}

const a = new FixedArray(8);
[5, 3, 8, 1].forEach((v, i) => a.insert(i, v));
console.log('init:       ' + a);
a.insert(2, 42); console.log('insert(2,42): ' + a);
a.data[0] = 7; console.log('set a[0]=7:   ' + a);
const v = a.delete(1);
console.log(`delete(1) -> ${v} ${a}`);
console.log('search(8) ->', a.search(8));
