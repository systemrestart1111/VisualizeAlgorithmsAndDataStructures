// 由高位到低位的平方乘法：每讀一個位元就把結果平方，該位是 1 再乘上 a；全程取模讓數字保持很小
// （m 不大於 2^26 時中間值不會超過 2^53；更大的模數請改用 BigInt）
function modPow(a, n, m) {
  let result = 1;
  for (const bit of n.toString(2)) {
    result = (result * result) % m;
    if (bit === '1') result = (result * a) % m;
    console.log(`bit ${bit}: ${result}`);
  }
  return result;
}

console.log('7^560 mod 561 =', modPow(7, 560, 561));
