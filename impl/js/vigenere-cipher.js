// 關鍵字字母決定位移；非字母原樣輸出且不消耗關鍵字位置
function vigenere(text, key, decrypt = false) {
  const K = key.toUpperCase().replace(/[^A-Z]/g, '');
  let j = 0;
  return text.replace(/[A-Za-z]/g, (ch) => {
    let k = K.charCodeAt(j++ % K.length) - 65;
    if (decrypt) k = 26 - k;
    const base = ch <= 'Z' ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + k) % 26) + base);
  });
}

const c = vigenere('ATTACK AT DAWN!', 'LEMON');
console.log('cipher:', c);
console.log('plain :', vigenere(c, 'LEMON', true));
console.log('mixed :', vigenere('Hello, World', 'key'));
