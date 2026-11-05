let state = 42;
// Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1
const randInt = (k) => (state = (state * 48271) % 2147483647) % k;

const a = Array.from({ length: 12 }, (_, i) => i + 1);
// 由後往前，每個位置 i 與 0..i 中隨機一格交換；每種排列出現的機率都是 1/n!
for (let i = a.length - 1; i > 0; i--) {
  const j = randInt(i + 1);
  [a[i], a[j]] = [a[j], a[i]];
}
console.log('shuffled:', a.join(' '));
