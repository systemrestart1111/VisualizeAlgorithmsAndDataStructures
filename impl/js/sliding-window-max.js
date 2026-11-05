// 單調遞減雙端佇列（存索引）：隊首永遠是視窗內最大值的位置
function windowMax(a, k) {
  const dq = [], res = [];
  let head = 0;
  for (let i = 0; i < a.length; i++) {
    while (dq.length > head && a[dq[dq.length - 1]] <= a[i]) dq.pop(); // 比 a[i] 小的元素再也不會成為最大值
    dq.push(i);
    if (dq[head] <= i - k) head++;                                     // 隊首已離開視窗
    if (i >= k - 1) res.push(a[dq[head]]);
  }
  return res;
}

console.log(windowMax([1, 3, -1, -3, 5, 3, 6, 7, 2, 4, 1], 3).join(' '));
