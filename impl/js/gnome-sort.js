// 像侏儒整理花盆：順序正確就前進，否則交換並後退一步
function gnomeSort(a) {
  let i = 0;
  while (i < a.length) {
    if (i === 0 || a[i - 1] <= a[i]) i++;
    else {
      [a[i - 1], a[i]] = [a[i], a[i - 1]];
      i--;
    }
  }
}

const a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72];
gnomeSort(a);
console.log(a.join(' '));
