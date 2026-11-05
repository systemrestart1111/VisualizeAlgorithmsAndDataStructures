// 輕量語法高亮：將原始碼切成 token（註解、字串、數字、關鍵字、函式名、型別），再依換行分成多行

export type Tok = { t: string; c?: 'cm' | 'st' | 'nu' | 'kw' | 'fn' | 'ty' | 'pp' };

const KW: Record<string, string> = {
  python: 'and as assert break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return True try while with yield',
  c: 'break case const continue default do else enum extern for goto if inline return sizeof static struct switch typedef union while NULL true false',
  cpp: 'auto break case class const constexpr continue default delete do else enum for friend if inline namespace new nullptr operator private protected public return sizeof static struct switch template this typename using virtual while true false',
  java: 'abstract boolean break case catch class continue default do else extends final finally for if implements import instanceof interface new null package private protected public return static super switch this throw throws try void while true false var',
  js: 'async await break case catch class const continue default delete do else export extends false finally for function if in instanceof let new null of return static super switch this throw true try typeof undefined var void while yield',
};
const TY: Record<string, string> = {
  python: 'int float str list dict set tuple bool range len print min max sorted enumerate zip',
  c: 'int long short char double float void unsigned signed bool size_t',
  cpp: 'int long short char double float void unsigned signed bool size_t string vector pair map set unordered_map unordered_set queue deque stack priority_queue array tuple',
  java: 'int long short char double float byte String Integer Long Double List ArrayList Map HashMap Set HashSet Deque ArrayDeque Queue PriorityQueue LinkedList Arrays Collections StringBuilder Math System Object',
  js: 'Array Map Set Math Number String Object JSON Infinity console BigInt',
};

const cache: Record<string, { re: RegExp; kw: Set<string>; ty: Set<string> }> = {};
function rules(lang: string) {
  if (cache[lang]) return cache[lang];
  const py = lang === 'python';
  const comment = py ? String.raw`#[^\n]*` : String.raw`\/\/[^\n]*|\/\*[\s\S]*?\*\/`;
  const str = py
    ? String.raw`"""[\s\S]*?"""|'''[\s\S]*?'''|[fFrRbB]?"(?:\\.|[^"\\\n])*"|[fFrRbB]?'(?:\\.|[^'\\\n])*'`
    : lang === 'js'
      ? String.raw`\`(?:\\.|[^\`\\])*\`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'`
      : String.raw`"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'`;
  const pp = lang === 'c' || lang === 'cpp' ? String.raw`|(^[ \t]*#[^\n]*)` : '';
  const re = new RegExp(`(${comment})|(${str})|(\\b\\d[\\d_]*(?:\\.\\d+)?(?:[eE][+-]?\\d+)?[LlUuFf]*\\b|\\b0[xX][\\da-fA-F]+\\b)|([A-Za-z_$][\\w$]*)(?=\\s*\\()|([A-Za-z_$][\\w$]*)${pp}`, 'gm');
  return (cache[lang] = { re, kw: new Set(KW[lang].split(' ')), ty: new Set(TY[lang].split(' ')) });
}

export function highlight(code: string, lang: string): Tok[][] {
  const { re, kw, ty } = rules(lang);
  const toks: Tok[] = [];
  let last = 0;
  re.lastIndex = 0;
  for (let m = re.exec(code); m; m = re.exec(code)) {
    if (m.index > last) toks.push({ t: code.slice(last, m.index) });
    const s = m[0];
    if (m[1]) toks.push({ t: s, c: 'cm' });
    else if (m[2]) toks.push({ t: s, c: 'st' });
    else if (m[3]) toks.push({ t: s, c: 'nu' });
    else if (m[4]) toks.push({ t: s, c: kw.has(s) ? 'kw' : ty.has(s) ? 'ty' : 'fn' });
    else if (m[5]) toks.push({ t: s, c: kw.has(s) ? 'kw' : ty.has(s) ? 'ty' : undefined });
    else if (m[6]) toks.push({ t: s, c: 'pp' });
    else toks.push({ t: s });
    last = m.index + s.length;
    if (s.length === 0) re.lastIndex++;
  }
  if (last < code.length) toks.push({ t: code.slice(last) });
  // 依換行切成多行（跨行的註解或字串會拆到各行並保留樣式）
  const lines: Tok[][] = [[]];
  for (const tk of toks) {
    const parts = tk.t.split('\n');
    parts.forEach((p, i) => {
      if (i > 0) lines.push([]);
      if (p) lines[lines.length - 1].push({ t: p, c: tk.c });
    });
  }
  return lines;
}
