// 一次掃描維護 first 與 second；distinct=true 求第二大相異值，不存在回傳 null
function secondLargest(a, distinct = true) {
  let first = null, second = null;
  for (const x of a) {
    if (first === null || x > first) { second = first; first = x; }
    else if (x === first) { if (!distinct) second = x; }
    else if (second === null || x > second) second = x;
  }
  return second;
}

for (const a of [[12, 35, 1, 10, 34, 35, 1], [5, 5, 3], [7, 7, 7], [4]]) {
  const d = secondLargest(a), r = secondLargest(a, false);
  console.log(`[${a.join(', ')}] distinct: ${d ?? 'none'} rank: ${r ?? 'none'}`);
}
