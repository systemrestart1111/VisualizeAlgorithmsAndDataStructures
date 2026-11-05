const PREC = { '+': 1, '-': 1, '*': 2, '/': 2, neg: 2.5, '^': 3 };
const RIGHT = new Set(['^', 'neg']);
const FUNCS = { max: [2, Math.max], min: [2, Math.min], sqrt: [1, Math.sqrt], abs: [1, Math.abs] };

// 調度場演算法：支援函式、逗號參數與一元負號，輸出後序（RPN）
function toRpn(expr) {
  const tokens = expr.match(/\d+\.?\d*|[a-z]+|[-+*/^(),]/g);
  const out = [], ops = [];
  let prev = null;
  for (let t of tokens) {
    if (/^\d/.test(t)) out.push(Number(t));
    else if (t in FUNCS || t === '(') ops.push(t);
    else if (t === ',') { while (ops[ops.length - 1] !== '(') out.push(ops.pop()); }
    else if (t === ')') {
      while (ops[ops.length - 1] !== '(') out.push(ops.pop());
      ops.pop();
      if (ops.length && ops[ops.length - 1] in FUNCS) out.push(ops.pop());
    } else {
      if (t === '-' && (prev === null || prev in PREC || prev === '(' || prev === ',')) t = 'neg'; // 一元負號
      else
        while (ops.length && ops[ops.length - 1] in PREC) {
          const top = ops[ops.length - 1];
          if (!(PREC[top] > PREC[t] || (PREC[top] === PREC[t] && !RIGHT.has(t)))) break;
          out.push(ops.pop());
        }
      ops.push(t);
    }
    prev = t;
  }
  while (ops.length) out.push(ops.pop());
  return out;
}

function evalRpn(rpn) {
  const st = [];
  for (const t of rpn) {
    if (typeof t === 'number') st.push(t);
    else if (t === 'neg') st.push(-st.pop());
    else if (t in FUNCS) {
      const [n, f] = FUNCS[t];
      st.push(f(...st.splice(st.length - n, n)));
    } else {
      const b = st.pop(), a = st.pop();
      st.push({ '+': a + b, '-': a - b, '*': a * b, '/': a / b, '^': a ** b }[t]);
    }
  }
  return st[0];
}

const fmt = (x) => (Number.isInteger(x) ? String(x) : x.toFixed(4));
const rpn = toRpn('3 + max(4, 2 * 5) * -2 ^ 2 - sqrt(16)');
console.log('RPN:', rpn.map((t) => (typeof t === 'number' ? fmt(t) : t)).join(' '));
console.log('value =', fmt(evalRpn(rpn)));
