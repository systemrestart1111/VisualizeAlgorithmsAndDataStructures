// 至少有一半是有序的；a[lo] = a[mid] = a[hi] 時無法判斷，兩端各縮一格
function search(a, t) {
  let lo = 0, hi = a.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] === t) return mid;
    if (a[lo] === a[mid] && a[mid] === a[hi]) { lo++; hi--; }
    else if (a[lo] <= a[mid]) { if (a[lo] <= t && t < a[mid]) hi = mid - 1; else lo = mid + 1; }
    else { if (a[mid] < t && t <= a[hi]) lo = mid + 1; else hi = mid - 1; }
  }
  return -1;
}

const a = [45, 52, 60, 67, 74, 3, 8, 12, 17, 23, 31, 38];
for (const t of [12, 45, 38, 50]) console.log(`find ${t}: ${search(a, t)}`);
console.log('duplicates find 3:', search([2, 2, 2, 3, 2, 2, 2], 3));
