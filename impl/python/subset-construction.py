def thompson(re):
    """與 thompson-nfa 相同：先轉後序式，再以堆疊組合片段"""
    tokens = []
    for i, c in enumerate(re):
        tokens.append(c)
        if i + 1 < len(re) and re[i + 1] not in "|)*+?" and c not in "(|":
            tokens.append(".")
    prec = {"|": 1, ".": 2, "*": 3, "+": 3, "?": 3}
    out, ops = [], []
    for t in tokens:
        if t.isalnum():
            out.append(t)
        elif t == "(":
            ops.append(t)
        elif t == ")":
            while ops[-1] != "(":
                out.append(ops.pop())
            ops.pop()
        else:
            while ops and ops[-1] != "(" and prec[ops[-1]] >= prec[t]:
                out.append(ops.pop())
            ops.append(t)
    trans, st, n = [], [], 0
    for t in out + ops[::-1]:
        if t.isalnum():
            trans.append((n, n + 1, t))
            st.append((n, n + 1))
            n += 2
        elif t == ".":
            b, a = st.pop(), st.pop()
            trans.append((a[1], b[0], None))
            st.append((a[0], b[1]))
        elif t == "|":
            b, a = st.pop(), st.pop()
            trans += [(n, a[0], None), (n, b[0], None), (a[1], n + 1, None), (b[1], n + 1, None)]
            st.append((n, n + 1))
            n += 2
        else:
            a = st.pop()
            trans += [(n, a[0], None), (a[1], n + 1, None)]
            if t != "+":
                trans.append((n, n + 1, None))
            if t != "?":
                trans.append((a[1], a[0], None))
            st.append((n, n + 1))
            n += 2
    return st[0][0], st[0][1], trans


def closure(trans, states):
    out, stack = set(states), list(states)
    while stack:
        u = stack.pop()
        for a, b, c in trans:
            if a == u and c is None and b not in out:
                out.add(b)
                stack.append(b)
    return frozenset(out)


def subset(start, accept, trans):
    """DFA 狀態 = NFA 狀態集合；BFS 取 move 後的 ε-closure"""
    alpha = sorted({c for _, _, c in trans if c})
    states = [closure(trans, {start})]
    table = [{}]
    i = 0
    while i < len(states):
        for c in alpha:
            mv = {b for a, b, ch in trans if a in states[i] and ch == c}
            if not mv:
                continue
            t = closure(trans, mv)
            if t not in states:
                states.append(t)
                table.append({})
            table[i][c] = states.index(t)
        i += 1
    return states, table, [accept in s for s in states], alpha


def dfa_accepts(table, acc, w):
    s = 0
    for ch in w:
        if ch not in table[s]:
            return False
        s = table[s][ch]
    return acc[s]


for re in ["(a|b)*abb", "a(b|c)*", "(ab)+c?"]:
    start, accept, trans = thompson(re)
    states, table, acc, alpha = subset(start, accept, trans)
    words = [""]
    for _ in range(5):
        words += [w + c for w in words if len(w) == len(words[-1]) for c in alpha]
    words = sorted(set(words), key=lambda w: (len(w), w))
    cur_ok = 0
    for w in words:
        cur = closure(trans, {start})
        for ch in w:
            cur = closure(trans, {b for a, b, c in trans if a in cur and c == ch})
        cur_ok += (accept in cur) == dfa_accepts(table, acc, w)
    print(f"{re}: DFA states {len(states)}, accepting {sum(acc)}, agree on {cur_ok}/{len(words)} strings")
