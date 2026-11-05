def to_postfix(re):
    """插入隱含的連接符號「.」後，用 Shunting-yard 轉成後序式"""
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
    return out + ops[::-1]


def thompson(re):
    """每個片段有一個起點與一個接受狀態；回傳 (起點, 接受, 狀態數, 轉移)"""
    trans, n, st = [], [0], []

    def new():
        n[0] += 1
        return n[0] - 1

    for t in to_postfix(re):
        if t.isalnum():
            s, a = new(), new()
            trans.append((s, a, t))
            st.append((s, a))
        elif t == ".":
            b, a = st.pop(), st.pop()
            trans.append((a[1], b[0], None))
            st.append((a[0], b[1]))
        elif t == "|":
            b, a = st.pop(), st.pop()
            s, e = new(), new()
            trans += [(s, a[0], None), (s, b[0], None), (a[1], e, None), (b[1], e, None)]
            st.append((s, e))
        else:
            a = st.pop()
            s, e = new(), new()
            trans += [(s, a[0], None), (a[1], e, None)]
            if t != "+":
                trans.append((s, e, None))
            if t != "?":
                trans.append((a[1], a[0], None))
            st.append((s, e))
    start, accept = st.pop()
    return start, accept, n[0], trans


def closure(trans, states):
    out, stack = set(states), list(states)
    while stack:
        u = stack.pop()
        for a, b, c in trans:
            if a == u and c is None and b not in out:
                out.add(b)
                stack.append(b)
    return out


def accepts(nfa, w):
    start, accept, _, trans = nfa
    cur = closure(trans, {start})
    for ch in w:
        cur = closure(trans, {b for a, b, c in trans if a in cur and c == ch})
    return accept in cur


for re, tests in [("(a|b)*abb", ["abb", "aabb", "babb", "ab", "", "abab"]), ("a(b|c)*", ["a", "abcb", "b", "ac"]), ("(ab)+c?", ["ab", "ababc", "c", "abcc"])]:
    nfa = thompson(re)
    print(f"{re}: {nfa[2]} states, {len(nfa[3])} transitions;", " ".join(f"{w or 'ε'}={'Y' if accepts(nfa, w) else 'N'}" for w in tests))
