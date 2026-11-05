// 第一個 >= t 的位置
function lowerBound(a, t) {
  let lo = 0, hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] < t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// 第一個 > t 的位置
function upperBound(a, t) {
  let lo = 0, hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] <= t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

const a = [2, 4, 4, 4, 7, 9, 9, 12, 15, 15, 15, 18];
const lb = lowerBound(a, 9), ub = upperBound(a, 9);
console.log('lower_bound(9) =', lb);
console.log('upper_bound(9) =', ub);
console.log('count of 9 =', ub - lb);
