// 每次合併最短的兩個檔案（與霍夫曼編碼同樣的貪婪策略），總搬移成本最小
const files = [20, 30, 10, 5, 30, 15];
const popMin = () => files.splice(files.indexOf(Math.min(...files)), 1)[0];
let total = 0;
while (files.length > 1) {
  const a = popMin(), b = popMin();
  total += a + b;
  files.push(a + b);
  console.log(`merge ${a} + ${b} = ${a + b}`);
}
console.log('total cost =', total);
