// 多數投票：相同就 +1、不同就 -1，歸零時換候選人；最後再驗證一次是否過半
function majority(a) {
  let cand = null, count = 0;
  for (const x of a) {
    if (count === 0) cand = x;
    count += x === cand ? 1 : -1;
  }
  const occ = a.filter((x) => x === cand).length;
  return [occ * 2 > a.length ? cand : 'None', occ];
}

const a = [2, 2, 1, 3, 2, 1, 2, 2, 3, 2, 1, 2, 2];
const [m, occ] = majority(a);
console.log(`majority = ${m} (${occ}/${a.length})`);
