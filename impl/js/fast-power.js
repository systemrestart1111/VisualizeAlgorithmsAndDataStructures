// 把 n 看成二進位，由低位到高位：base 每次平方，該位是 1 時就乘進結果，只需 O(log n) 次乘法
function fastPower(a, n) {
  let result = 1, base = a;
  while (n) {
    const bit = n & 1;
    if (bit) result *= base;
    console.log(`bit ${bit}: result = ${result}, base = ${base}`);
    base *= base;
    n >>= 1;
  }
  return result;
}

console.log('3^13 =', fastPower(3, 13));
