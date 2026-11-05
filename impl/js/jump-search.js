// a 已排序；每次跳 √n 格找到區塊，再在區塊內線性搜尋
function jumpSearch(a, t) {
  const n = a.length, step = Math.floor(Math.sqrt(n));
  let prev = 0, cur = step;
  while (cur < n && a[cur - 1] < t) {
    prev = cur;
    cur += step;
  }
  for (let i = prev; i < Math.min(cur, n); i++) if (a[i] === t) return i;
  return -1;
}

const a = [1, 4, 7, 10, 14, 18, 21, 25, 29, 33, 38, 42, 47, 51, 56, 60];
console.log('search 47 ->', jumpSearch(a, 47));
console.log('search 30 ->', jumpSearch(a, 30));
