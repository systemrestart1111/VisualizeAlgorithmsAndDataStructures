// 左半最大堆積、右半最小堆積；保持 |左| = |右| 或 |右| + 1
class Heap {
  constructor(less) { this.h = []; this.less = less; }
  get size() { return this.h.length; }
  top() { return this.h[0]; }
  push(x) { const h = this.h; h.push(x); let i = h.length - 1; while (i && this.less(h[i], h[(i - 1) >> 1])) { [h[i], h[(i - 1) >> 1]] = [h[(i - 1) >> 1], h[i]]; i = (i - 1) >> 1; } }
  pop() {
    const h = this.h, top = h[0], last = h.pop();
    if (h.length) {
      h[0] = last;
      for (let i = 0; ;) { let m = i; const l = 2 * i + 1, r = l + 1; if (l < h.length && this.less(h[l], h[m])) m = l; if (r < h.length && this.less(h[r], h[m])) m = r; if (m === i) break; [h[i], h[m]] = [h[m], h[i]]; i = m; }
    }
    return top;
  }
}
const lo = new Heap((a, b) => a > b), hi = new Heap((a, b) => a < b);
function add(x) {
  if (!lo.size || x <= lo.top()) lo.push(x); else hi.push(x);
  if (lo.size > hi.size + 1) hi.push(lo.pop());
  else if (hi.size > lo.size) lo.push(hi.pop());
}
const median = () => (lo.size > hi.size ? lo.top() : (lo.top() + hi.top()) / 2);

const out = [];
for (const x of [5, 15, 1, 3, 8, 7, 9, 10, 20, -4, 7, 7]) { add(x); out.push(`${x}->${median().toFixed(1)}`); }
console.log(out.join(' '));
