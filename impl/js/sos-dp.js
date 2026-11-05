// 一次處理一個位元：含第 b 位的 mask 加上「去掉第 b 位」的值
function sos(a) {
  const F = a.slice();
  for (let b = 0; 1 << b < F.length; b++) for (let m = 0; m < F.length; m++) if ((m >> b) & 1) F[m] += F[m ^ (1 << b)];
  return F;
}
function brute(a) {
  return a.map((_, m) => { let s = 0; for (let sub = m; ; sub = (sub - 1) & m) { s += a[sub]; if (!sub) break; } return s; });
}

const a = [3, 1, 4, 1, 5, 9, 2, 6];
const F = sos(a);
console.log('F:', F.join(' '));
console.log('matches brute force:', F.join() === brute(a).join() ? 'True' : 'False');
const b = Array.from({ length: 16 }, (_, i) => i + 1);
console.log('F (16):', sos(b).join(' '), '| ok:', sos(b).join() === brute(b).join() ? 'True' : 'False');
