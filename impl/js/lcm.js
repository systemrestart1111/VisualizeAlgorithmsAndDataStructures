const gcd = (a, b) => (b ? gcd(b, a % b) : a);

// lcm(a, b) = a / gcd(a, b) * b；多個數就依序兩兩求（先除後乘，避免溢位）
const nums = [12, 18, 30, 8];
let cur = nums[0];
for (const x of nums.slice(1)) {
  const g = gcd(cur, x), nxt = (cur / g) * x;
  console.log(`lcm(${cur}, ${x}) = ${cur} / ${g} x ${x} = ${nxt}`);
  cur = nxt;
}
console.log('lcm =', cur);
