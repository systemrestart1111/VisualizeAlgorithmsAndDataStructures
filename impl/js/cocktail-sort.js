// 雙向氣泡排序：先由左往右把最大值推到右端，再由右往左把最小值推到左端
function cocktailSort(a) {
  let lo = 0, hi = a.length - 1, swapped = true;
  while (swapped && lo < hi) {
    swapped = false;
    for (let i = lo; i < hi; i++)
      if (a[i] > a[i + 1]) { [a[i], a[i + 1]] = [a[i + 1], a[i]]; swapped = true; }
    hi--;
    for (let i = hi; i > lo; i--)
      if (a[i - 1] > a[i]) { [a[i - 1], a[i]] = [a[i], a[i - 1]]; swapped = true; }
    lo++;
  }
}

const a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72];
cocktailSort(a);
console.log(a.join(' '));
