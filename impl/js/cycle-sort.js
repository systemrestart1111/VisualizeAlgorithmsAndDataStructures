// 每個元素直接寫到最終位置；跳過重複值避免無窮迴圈。回傳寫入次數
function cycleSort(a) {
  let writes = 0;
  const n = a.length;
  const posOf = (start, item) => { let p = start; for (let i = start + 1; i < n; i++) if (a[i] < item) p++; return p; };
  for (let start = 0; start < n - 1; start++) {
    let item = a[start], pos = posOf(start, item);
    if (pos === start) continue;
    while (item === a[pos]) pos++;
    [a[pos], item] = [item, a[pos]]; writes++;
    while (pos !== start) {
      pos = posOf(start, item);
      while (pos !== start && item === a[pos]) pos++;
      if (pos === start) { a[start] = item; writes++; break; }
      [a[pos], item] = [item, a[pos]]; writes++;
    }
  }
  return writes;
}

const a = [20, 40, 50, 10, 30, 40, 20, 60, 10];
const w = cycleSort(a);
console.log('sorted:', a.join(' '));
console.log('writes:', w);
const b = [3, 3, 3, 1];
const before = b.join(' ');
cycleSort(b);
console.log('dups:', before, '->', b.join(' '));
