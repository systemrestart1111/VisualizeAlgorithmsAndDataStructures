let calls = 0;
// 單純遞迴：同一個子問題被重複計算，呼叫次數呈指數成長
function fibNaive(n) {
  calls++;
  return n < 2 ? n : fibNaive(n - 1) + fibNaive(n - 2);
}

// 記憶化遞迴：每個子問題只算一次
const memo = new Map();
function fibMemo(n) {
  if (n < 2) return n;
  if (!memo.has(n)) memo.set(n, fibMemo(n - 1) + fibMemo(n - 2));
  return memo.get(n);
}

// 表格法：由小到大填表
function fibTab(n) {
  const t = [0, 1];
  for (let i = 2; i <= n; i++) t[i] = t[i - 1] + t[i - 2];
  return t.slice(0, n + 1);
}

const n = 6;
const a = fibNaive(n);
console.log(`naive fib(${n}) = ${a}, calls = ${calls}`);
console.log(`memo  fib(${n}) = ${fibMemo(n)}`);
console.log('table:', fibTab(n).join(' '));
