// 兩個虛根（長度 −1、0）；每次從最長回文後綴往上找能在兩側接上 c 的回文
function eertree(s) {
  const len = [-1, 0], link = [0, 0], kids = [new Map(), new Map()], pal = ['', ''];
  let last = 1;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const fits = (v) => i - len[v] - 1 >= 0 && s[i - len[v] - 1] === c;
    let cur = last;
    while (!fits(cur)) cur = link[cur];
    if (kids[cur].has(c)) { last = kids[cur].get(c); continue; }
    const v = len.length;
    len.push(len[cur] + 2);
    pal.push(len[v] === 1 ? c : c + pal[cur] + c);
    kids.push(new Map());
    if (len[v] === 1) link.push(1);
    else { let w = link[cur]; while (!fits(w)) w = link[w]; link.push(kids[w].get(c)); }
    kids[cur].set(c, v);
    last = v;
  }
  return pal.slice(2);
}

for (const s of ['abacabadab', 'eertree', 'aaaa', 'abc']) {
  const p = eertree(s).sort();
  const brute = new Set();
  for (let i = 0; i < s.length; i++) for (let j = i + 1; j <= s.length; j++) { const t = s.slice(i, j); if (t === [...t].reverse().join('')) brute.add(t); }
  console.log(`${s}: ${p.length} palindromes [${p.map((x) => `'${x}'`).join(', ')}] (brute ${brute.size})`);
}
