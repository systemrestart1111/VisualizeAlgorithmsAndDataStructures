let state = 42;
// Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1
const randInt = (k) => (state = (state * 48271) % 2147483647) % k;

const STREAM = [12, 45, 7, 33, 89, 21, 64, 3, 58, 90, 17, 76, 40, 5, 61], K = 4;
// 演算法 R：先放前 k 個；第 i 個（0 起算）元素以 k/(i+1) 的機率取代蓄水池中隨機一格
// 不需事先知道串流長度，最後每個元素被選中的機率都是 k/n
const res = STREAM.slice(0, K);
for (let i = K; i < STREAM.length; i++) {
  const j = randInt(i + 1);
  if (j < K) {
    console.log(`item ${STREAM[i]} replaces slot ${j} (${res[j]})`);
    res[j] = STREAM[i];
  }
}
console.log('sample:', res.join(' '));
