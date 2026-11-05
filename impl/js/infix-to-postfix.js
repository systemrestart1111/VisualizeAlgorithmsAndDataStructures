const PREC = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };

// 運算元直接輸出；運算子進堆疊前，先彈出優先權較高（或相同且左結合）的運算子
function toPostfix(expr) {
  const out = [], stack = [];
  for (const ch of expr.replace(/\s+/g, '')) {
    if (/[A-Za-z0-9]/.test(ch)) out.push(ch);
    else if (ch === '(') stack.push(ch);
    else if (ch === ')') {
      while (stack[stack.length - 1] !== '(') out.push(stack.pop());
      stack.pop();
    } else {
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top === '(' || !(PREC[top] > PREC[ch] || (PREC[top] === PREC[ch] && ch !== '^'))) break;
        out.push(stack.pop());
      }
      stack.push(ch);
    }
  }
  while (stack.length) out.push(stack.pop());
  return out.join(' ');
}

console.log(toPostfix('A + B * (C - D) / E ^ F ^ G'));
