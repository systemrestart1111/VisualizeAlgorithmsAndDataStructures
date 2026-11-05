// 以 i 結尾的最大和 = max(a[i], 前一個的最大和 + a[i])；同時記錄區間
function kadane(a) {
  let best = a[0], cur = a[0], start = 0, bl = 0, br = 0;
  for (let i = 1; i < a.length; i++) {
    if (cur < 0) { cur = a[i]; start = i; }
    else cur += a[i];
    if (cur > best) { best = cur; bl = start; br = i; }
  }
  return [best, bl, br];
}

const [s, l, r] = kadane([-2, 1, -3, 4, -1, 2, 1, -5, 4, 3, -2, 2]);
console.log(`max sum = ${s}, range [${l}, ${r}]`);
