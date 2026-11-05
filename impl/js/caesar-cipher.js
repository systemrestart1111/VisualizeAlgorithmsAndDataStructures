// 每個字母位移 k 格（mod 26），保留大小寫，非字母原樣輸出
function caesar(text, k) {
  k = ((k % 26) + 26) % 26;
  return text.replace(/[A-Za-z]/g, (ch) => {
    const base = ch <= 'Z' ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + k) % 26) + base);
  });
}

const msg = 'Hello, World! XYZ';
const c = caesar(msg, 3);
console.log('encrypt k=3:', c);
console.log('decrypt   :', caesar(c, -3));
for (const k of [0, 25, 26]) console.log(`k=${k}:`, caesar(msg, k));
