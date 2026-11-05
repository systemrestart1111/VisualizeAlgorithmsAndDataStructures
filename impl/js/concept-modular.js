// 數學上的模：JS 的 % 對負數會得到負餘數，需加 m 修正到 [0, m)
const normMod = (a, m) => ((a % m) + m) % m;

const nums = [-1, 27, 52, 13, -27], m = 26;
for (const x of nums) console.log(`${x} mod ${m} = ${normMod(x, m)}`);
const [a, b] = nums;
console.log(`(${a} + ${b}) mod ${m} = ${normMod(a + b, m)} = ${normMod(normMod(a, m) + normMod(b, m), m)}`);
console.log(`(${a} * ${b}) mod ${m} = ${normMod(a * b, m)} = ${normMod(normMod(a, m) * normMod(b, m), m)}`);
console.log(`27 ≡ 1 (mod 26): ${normMod(27, m) === normMod(1, m) ? 'True' : 'False'}`);
