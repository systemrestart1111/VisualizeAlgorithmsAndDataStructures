// D 的第 j 位表示 pat[0..j] 目前是否匹配；D = ((D << 1) | 1) & B[c]
function shiftAnd(text, pat) {
  const m = pat.length, B = {};
  for (let j = 0; j < m; j++) B[pat[j]] = (B[pat[j]] ?? 0) | (1 << j);
  let D = 0;
  const out = [];
  for (let i = 0; i < text.length; i++) {
    D = ((D << 1) | 1) & (B[text[i]] ?? 0);
    if (D & (1 << (m - 1))) out.push(i - m + 1);
  }
  return out;
}

for (const [text, pat] of [['abracadabra cadabra', 'abra'], ['aaaaa', 'aa'], ['the cat sat on the mat', 'at'], ['abc', 'abcd']]) {
  const brute = [];
  for (let i = 0; i + pat.length <= text.length; i++) if (text.slice(i, i + pat.length) === pat) brute.push(i);
  console.log(`'${pat}' in '${text}': [${shiftAnd(text, pat).join(', ')}] (brute [${brute.join(', ')}])`);
}
