// 最小堆積放 [值, 串列編號, 位置]，每次取最小者並補上同串列的下一個
function kwayMerge(lists) {
  const heap = [];
  const less = (a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
  const push = (e) => { heap.push(e); let i = heap.length - 1; while (i && less(heap[i], heap[(i - 1) >> 1])) { [heap[i], heap[(i - 1) >> 1]] = [heap[(i - 1) >> 1], heap[i]]; i = (i - 1) >> 1; } };
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      for (let i = 0; ;) { let m = i; const l = 2 * i + 1, r = l + 1; if (l < heap.length && less(heap[l], heap[m])) m = l; if (r < heap.length && less(heap[r], heap[m])) m = r; if (m === i) break; [heap[i], heap[m]] = [heap[m], heap[i]]; i = m; }
    }
    return top;
  };
  lists.forEach((l, i) => l.length && push([l[0], i, 0]));
  const out = [];
  while (heap.length) {
    const [x, i, p] = pop();
    out.push(x);
    if (p + 1 < lists[i].length) push([lists[i][p + 1], i, p + 1]);
  }
  return out;
}

console.log(kwayMerge([[1, 4, 9, 12], [2, 3, 10], [], [5], [6, 7, 8, 11, 13]]).join(' '));
console.log(kwayMerge([[], []]).join(' ') + ' (empty)');
console.log(kwayMerge([[1, 1, 2], [1, 3]]).join(' '));
