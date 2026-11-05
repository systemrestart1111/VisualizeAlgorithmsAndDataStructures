// 發牌到「牌頂 ≥ x」的最左牌堆；再用最小堆積多路合併各堆牌頂
function patienceSort(a) {
  const piles = [];
  for (const x of a) {
    let lo = 0, hi = piles.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (piles[m].at(-1) >= x) hi = m; else lo = m + 1; }
    if (lo === piles.length) piles.push([]);
    piles[lo].push(x);
  }
  const k = piles.length;
  const heap = [];
  const less = (p, q) => p[0] < q[0] || (p[0] === q[0] && p[1] < q[1]);
  const push = (e) => { heap.push(e); let i = heap.length - 1; while (i && less(heap[i], heap[(i - 1) >> 1])) { [heap[i], heap[(i - 1) >> 1]] = [heap[(i - 1) >> 1], heap[i]]; i = (i - 1) >> 1; } };
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      for (let i = 0; ;) { let m = i; const l = 2 * i + 1, r = l + 1; if (l < heap.length && less(heap[l], heap[m])) m = l; if (r < heap.length && less(heap[r], heap[m])) m = r; if (m === i) break; [heap[i], heap[m]] = [heap[m], heap[i]]; i = m; }
    }
    return top;
  };
  piles.forEach((p, i) => push([p.at(-1), i]));
  const out = [];
  while (heap.length) {
    const [x, i] = pop();
    out.push(x);
    piles[i].pop();
    if (piles[i].length) push([piles[i].at(-1), i]);
  }
  return [out, k];
}

const [out, k] = patienceSort([6, 3, 9, 2, 8, 3, 7, 1, 5, 4, 9]);
console.log('piles:', k);
console.log('sorted:', out.join(' '));
