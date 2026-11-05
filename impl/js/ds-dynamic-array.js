// 容量滿時加倍、只剩 1/4 時減半；搬移成本攤銷後，每次 append / pop 平均 O(1)
// （JS 的 Array 本身就是動態陣列，這裡用固定長度的陣列自己管理容量）
class DynamicArray {
  constructor() { this.cap = 1; this.size = 0; this.data = new Array(1); }
  resize(cap) {
    const nd = new Array(cap);
    for (let i = 0; i < this.size; i++) nd[i] = this.data[i];
    this.data = nd;
    this.cap = cap;
  }
  append(v) {
    if (this.size === this.cap) this.resize(this.cap * 2);
    this.data[this.size++] = v;
  }
  pop() {
    const v = this.data[--this.size];
    if (this.cap > 1 && this.size <= Math.floor(this.cap / 4)) this.resize(Math.floor(this.cap / 2));
    return v;
  }
  toString() { return `[${this.data.slice(0, this.size).join(' ')}] size=${this.size} cap=${this.cap}`; }
}

const a = new DynamicArray();
for (const v of [10, 20, 30, 40, 50]) { a.append(v); console.log(`append ${v}: ${a}`); }
for (let i = 0; i < 4; i++) { const v = a.pop(); console.log(`pop -> ${v}: ${a}`); }
