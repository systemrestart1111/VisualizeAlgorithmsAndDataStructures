// 最小堆積
class MinHeap {
  constructor() { this.h = []; }
  get size() { return this.h.length; }
  peek() { return this.h[0]; }
  push(x) {
    const h = this.h;
    h.push(x);
    for (let i = h.length - 1; i > 0 && h[(i - 1) >> 1] > h[i]; i = (i - 1) >> 1)
      [h[i], h[(i - 1) >> 1]] = [h[(i - 1) >> 1], h[i]];
  }
  replaceTop(x) {
    const h = this.h;
    h[0] = x;
    for (let i = 0; ; ) {
      let s = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < h.length && h[l] < h[s]) s = l;
      if (r < h.length && h[r] < h[s]) s = r;
      if (s === i) return;
      [h[i], h[s]] = [h[s], h[i]];
      i = s;
    }
  }
}

// 維持大小為 k 的最小堆積：比堆頂大的元素才換進來，最後堆內就是最大的 k 個
function topK(a, k) {
  const heap = new MinHeap();
  for (const x of a) {
    if (heap.size < k) heap.push(x);
    else if (x > heap.peek()) heap.replaceTop(x);
  }
  return [...heap.h].sort((x, y) => y - x);
}

const a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47];
console.log('top 4:', topK(a, 4).join(' '));
