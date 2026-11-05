// a 已排序且分布均勻；依數值比例估計位置，而不是取中間
function interpolationSearch(a, t) {
  let lo = 0, hi = a.length - 1;
  while (lo <= hi && a[lo] <= t && t <= a[hi]) {
    const pos = a[hi] === a[lo] ? lo : lo + Math.floor(((t - a[lo]) * (hi - lo)) / (a[hi] - a[lo]));
    if (a[pos] === t) return pos;
    if (a[pos] < t) lo = pos + 1;
    else hi = pos - 1;
  }
  return -1;
}

const a = [10, 14, 19, 26, 27, 31, 33, 35, 42, 44, 51, 58, 63, 70, 77, 85];
console.log('search 58 ->', interpolationSearch(a, 58));
console.log('search 40 ->', interpolationSearch(a, 40));
