// 與其他語言一致的示範亂數；真正的 OTP 需要密碼學安全的亂數
let s = 42;
const randByte = () => { s = (s * 48271) % 2147483647; return s % 256; };
const hex = (b) => b.map((x) => x.toString(16).padStart(2, '0')).join('');

const m1 = [...Buffer.from('HELLO WORLD')], m2 = [...Buffer.from('SECRET PLAN')];
const key = m1.map(() => randByte());
const c1 = m1.map((x, i) => x ^ key[i]), c2 = m2.map((x, i) => x ^ key[i]);
console.log('key :', hex(key));
console.log('c1  :', hex(c1));
console.log('back:', String.fromCharCode(...c1.map((x, i) => x ^ key[i])));
const x1 = c1.map((x, i) => x ^ c2[i]), x2 = m1.map((x, i) => x ^ m2[i]);
console.log('c1^c2:', hex(x1));
console.log('m1^m2:', hex(x2));
console.log('key reuse leaks m1^m2:', hex(x1) === hex(x2) ? 'True' : 'False');
