// 荷蘭國旗：lt 左邊 < p，gt 右邊 > p，中間 = p；一次掃描完成
function threeWayPartition(a, p) {
  let lt = 0, i = 0, gt = a.length - 1;
  while (i <= gt) {
    if (a[i] < p) { [a[lt], a[i]] = [a[i], a[lt]]; lt++; i++; }
    else if (a[i] > p) { [a[i], a[gt]] = [a[gt], a[i]]; gt--; }
    else i++;
  }
  return [lt, gt];
}

const a = [2, 0, 1, 2, 1, 0, 0, 2, 1, 1, 0, 2, 1, 0];
const [lt, gt] = threeWayPartition(a, 1);
console.log(a.join(' '));
console.log(`< p: [0, ${lt}), = p: [${lt}, ${gt}], > p: (${gt}, ${a.length})`);
