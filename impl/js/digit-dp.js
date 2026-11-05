// 數位 DP：由高位往低位填數字；tight 表示前面都和 N 相同（這一位不能超過 N 的對應位）
function countDigitSum(N, S) {
  const digits = [...String(N)].map(Number), memo = new Map();
  function go(pos, rest, tight) {
    if (rest < 0) return 0;
    if (pos === digits.length) return rest === 0 ? 1 : 0;
    const key = `${pos},${rest},${tight}`;
    if (memo.has(key)) return memo.get(key);
    const top = tight ? digits[pos] : 9;
    let r = 0;
    for (let d = 0; d <= top; d++) r += go(pos + 1, rest - d, tight && d === top);
    memo.set(key, r);
    return r;
  }
  return go(0, S, true);
}

const N = 345, S = 10;
console.log(`numbers in [0, ${N}] with digit sum ${S}:`, countDigitSum(N, S));
let brute = 0;
for (let x = 0; x <= N; x++) if ([...String(x)].reduce((s, c) => s + Number(c), 0) === S) brute++;
console.log('brute force check:', brute);
