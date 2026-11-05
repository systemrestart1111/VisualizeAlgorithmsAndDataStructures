const gcd = (a, b) => (b ? gcd(b, a % b) : a);

// E(x) = (a·x + b) mod 26；D(y) = a⁻¹·(y − b) mod 26；a 必須與 26 互質
function affine(text, a, b, decrypt = false) {
  if (gcd(a, 26) !== 1) throw new Error('a 與 26 不互質');
  let ai = 1;
  while ((a * ai) % 26 !== 1) ai++;
  return text.replace(/[A-Za-z]/g, (ch) => {
    const base = ch <= 'Z' ? 65 : 97, x = ch.charCodeAt(0) - base;
    const y = decrypt ? (((ai * (x - b)) % 26) + 26) % 26 : (a * x + b) % 26;
    return String.fromCharCode(base + y);
  });
}

const c = affine('AFFINE CIPHER', 5, 8);
console.log('cipher:', c);
console.log('plain :', affine(c, 5, 8, true));
try { affine('TEST', 13, 1); } catch { console.log('a=13 rejected'); }
