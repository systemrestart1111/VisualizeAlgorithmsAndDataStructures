// 從頭到尾逐一比較，找到回傳索引，找不到回傳 -1
function linearSearch(a, t) {
  for (let i = 0; i < a.length; i++) if (a[i] === t) return i;
  return -1;
}

const a = [29, 4, 71, 15, 42, 8, 63, 37, 90, 22];
console.log('search 63 ->', linearSearch(a, 63));
console.log('search 100 ->', linearSearch(a, 100));
