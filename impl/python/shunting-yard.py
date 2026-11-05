import math
import re

PREC = {"+": 1, "-": 1, "*": 2, "/": 2, "neg": 2.5, "^": 3}
RIGHT = {"^", "neg"}
FUNCS = {"max": (2, max), "min": (2, min), "sqrt": (1, math.sqrt), "abs": (1, abs)}


def to_rpn(expr):
    """調度場演算法：支援函式、逗號參數與一元負號，輸出後序（RPN）"""
    tokens = re.findall(r"\d+\.?\d*|[a-z]+|[-+*/^(),]", expr)
    out, ops, prev = [], [], None
    for t in tokens:
        if t[0].isdigit():
            out.append(float(t))
        elif t in FUNCS:
            ops.append(t)
        elif t == "(":
            ops.append(t)
        elif t == ",":
            while ops[-1] != "(":
                out.append(ops.pop())
        elif t == ")":
            while ops[-1] != "(":
                out.append(ops.pop())
            ops.pop()
            if ops and ops[-1] in FUNCS:
                out.append(ops.pop())
        else:
            if t == "-" and (prev is None or prev in PREC or prev in "(,"):
                t = "neg"  # 出現在開頭、運算子或左括號之後的減號是一元負號
            else:
                while ops and ops[-1] in PREC and (PREC[ops[-1]] > PREC[t] or (PREC[ops[-1]] == PREC[t] and t not in RIGHT)):
                    out.append(ops.pop())
            ops.append(t)
        prev = t
    while ops:
        out.append(ops.pop())
    return out


def eval_rpn(rpn):
    st = []
    for t in rpn:
        if isinstance(t, float):
            st.append(t)
        elif t == "neg":
            st.append(-st.pop())
        elif t in FUNCS:
            n, f = FUNCS[t]
            args = [st.pop() for _ in range(n)][::-1]
            st.append(float(f(*args)))
        else:
            b, a = st.pop(), st.pop()
            st.append({"+": a + b, "-": a - b, "*": a * b, "/": a / b if b else math.inf, "^": a ** b}[t])
    return st[0]


def fmt(x):
    return str(int(x)) if x == int(x) else f"{x:.4f}"


expr = "3 + max(4, 2 * 5) * -2 ^ 2 - sqrt(16)"
rpn = to_rpn(expr)
print("RPN:", " ".join(fmt(t) if isinstance(t, float) else t for t in rpn))
print("value =", fmt(eval_rpn(rpn)))
