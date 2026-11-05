const f = (x) => x ** 3 - 2 * x - 5;

// f(a) 與 f(b) 異號時區間內必有根；每次取中點，保留仍然異號的那一半，誤差每步減半
let a = 1, b = 3;
for (let i = 1; i <= 12; i++) {
  const m = (a + b) / 2;
  if (f(a) * f(m) <= 0) b = m;
  else a = m;
  console.log(`step ${String(i).padStart(2)}: [${a.toFixed(12)}, ${b.toFixed(12)}]`);
}
console.log(`root ~ ${((a + b) / 2).toFixed(12)}`);
