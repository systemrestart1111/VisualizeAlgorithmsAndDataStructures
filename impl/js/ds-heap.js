// 以陣列存放的完全二元樹：i 的子節點在 2i+1、2i+2，父節點在 (i-1)/2；堆頂永遠是最小值
class MinHeap {
  constructor(items = []) {
    this.a = [...items];
    for (let i = (this.a.length >> 1) - 1; i >= 0; i--) this.siftDown(i); // 自底向上建堆，O(n)
  }
  push(v) {
    const a = this.a;
    a.push(v);
    let i = a.length - 1;
    while (i > 0 && a[(i - 1) >> 1] > a[i]) { // 上浮
      const p = (i - 1) >> 1;
      [a[i], a[p]] = [a[p], a[i]];
      i = p;
    }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) { a[0] = last; this.siftDown(0); }
    return top;
  }
  siftDown(i) {
    const a = this.a, n = a.length;
    for (;;) {
      let s = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && a[l] < a[s]) s = l;
      if (r < n && a[r] < a[s]) s = r;
      if (s === i) return;
      [a[i], a[s]] = [a[s], a[i]];
      i = s;
    }
  }
  toString() { return `[${this.a.join(' ')}]`; }
}

const h = new MinHeap();
for (const v of [35, 12, 48, 7, 20, 3, 41]) { h.push(v); console.log(`push ${String(v).padStart(2)}: ${h}`); }
console.log('peek ->', h.a[0]);
for (let i = 0; i < 3; i++) { const top = h.pop(); console.log(`pop -> ${String(top).padStart(2)}: ${h}`); }
const b = new MinHeap([9, 4, 7, 1, 8, 2, 6]);
console.log('build [9 4 7 1 8 2 6] -> ' + b);
console.log('heap sort:', Array.from({ length: 7 }, () => b.pop()).join(' '));
