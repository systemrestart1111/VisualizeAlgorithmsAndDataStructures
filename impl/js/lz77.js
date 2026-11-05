// 在前面 window 個字元的「搜尋視窗」中找最長匹配，輸出 (往回距離, 長度, 下一個字元)；匹配可延伸到尚未編碼的部分
function lz77Encode(s, window) {
  const out = [];
  for (let i = 0; i < s.length; ) {
    let bestLen = 0, bestOff = 0;
    for (let off = 1; off <= Math.min(window, i); off++) {
      let len = 0;
      while (i + len < s.length - 1 && s[i - off + len] === s[i + len]) len++;
      if (len > bestLen) { bestLen = len; bestOff = off; }
    }
    out.push([bestOff, bestLen, s[i + bestLen]]);
    i += bestLen + 1;
  }
  return out;
}

function lz77Decode(tokens) {
  const out = [];
  for (const [off, len, ch] of tokens) {
    for (let r = 0; r < len; r++) out.push(out[out.length - off]);
    out.push(ch);
  }
  return out.join('');
}

const s = 'abracadabrarray';
const tokens = lz77Encode(s, 8);
console.log('tokens:', tokens.map(([o, l, c]) => `(${o},${l},${c})`).join(' '));
console.log('decode ok:', lz77Decode(tokens) === s ? 'True' : 'False');
