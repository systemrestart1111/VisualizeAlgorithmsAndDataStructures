// 找轉折點 i、從右邊找比 a[i] 大的最右元素交換，再反轉尾段；已是最大排列時回到最小
function nextPermutation(a) {
  let i = a.length - 2;
  while (i >= 0 && a[i] >= a[i + 1]) i--;
  if (i >= 0) {
    let j = a.length - 1;
    while (a[j] <= a[i]) j--;
    [a[i], a[j]] = [a[j], a[i]];
  }
  for (let x = i + 1, y = a.length - 1; x < y; x++, y--) [a[x], a[y]] = [a[y], a[x]];
  return a;
}

const a = [1, 3, 5, 4, 2];
for (let k = 0; k < 3; k++) console.log(nextPermutation(a).join(' '));
console.log('wrap:', nextPermutation([3, 2, 1]).join(' '));
const d = [1, 1, 2];
for (let k = 0; k < 3; k++) console.log('dup:', nextPermutation(d).join(' '));
