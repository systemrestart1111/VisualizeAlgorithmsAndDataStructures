PREC = {"+": 1, "-": 1, "*": 2, "/": 2, "^": 3}


def to_postfix(expr):
    """運算元直接輸出；運算子進堆疊前，先彈出優先權較高（或相同且左結合）的運算子"""
    out, stack = [], []
    for ch in expr.replace(" ", ""):
        if ch.isalnum():
            out.append(ch)
        elif ch == "(":
            stack.append(ch)
        elif ch == ")":
            while stack[-1] != "(":
                out.append(stack.pop())
            stack.pop()
        else:
            while stack and stack[-1] != "(" and (PREC[stack[-1]] > PREC[ch] or (PREC[stack[-1]] == PREC[ch] and ch != "^")):
                out.append(stack.pop())
            stack.append(ch)
    while stack:
        out.append(stack.pop())
    return " ".join(out)


print(to_postfix("A + B * (C - D) / E ^ F ^ G"))
