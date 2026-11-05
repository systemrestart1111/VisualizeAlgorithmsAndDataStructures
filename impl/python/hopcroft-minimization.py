# 龍書範例：(a|b)*abb 經子集合建構得到的 5 狀態 DFA
STATES = ["A", "B", "C", "D", "E"]
DELTA = {"A": {"a": "B", "b": "C"}, "B": {"a": "B", "b": "D"}, "C": {"a": "B", "b": "C"}, "D": {"a": "B", "b": "E"}, "E": {"a": "B", "b": "C"}}
ACCEPT = {"E"}
ALPHA = ["a", "b"]


def hopcroft():
    """P 從「接受／非接受」開始；用 W 中的分組 A 與字元 c 切開所有分組"""
    P = [set(ACCEPT), set(STATES) - ACCEPT]
    W = [min(P, key=len)]
    while W:
        A = W.pop(0)
        for c in ALPHA:
            X = {q for q in STATES if DELTA[q][c] in A}
            NP = []
            for Y in P:
                inter, diff = Y & X, Y - X
                if inter and diff:
                    NP += [inter, diff]
                    if Y in W:
                        W.remove(Y)
                        W += [inter, diff]
                    else:
                        W.append(inter if len(inter) <= len(diff) else diff)
                else:
                    NP.append(Y)
            P = NP
    return P


def accepts(delta, accept, start, w):
    s = start
    for ch in w:
        s = delta[s][ch]
    return s in accept


P = hopcroft()
groups = sorted("".join(sorted(g)) for g in P)
print("minimal states:", len(P), "groups:", " ".join("{" + g + "}" for g in groups))
rep = {q: "".join(sorted(g)) for g in P for q in g}
mdelta = {rep[q]: {c: rep[DELTA[q][c]] for c in ALPHA} for q in STATES}
words = [""]
for _ in range(6):
    words += [w + c for w in words if len(w) == len(words[-1]) for c in ALPHA]
words = sorted(set(words), key=lambda w: (len(w), w))
same = sum(accepts(DELTA, ACCEPT, "A", w) == accepts(mdelta, {rep["E"]}, rep["A"], w) for w in words)
print(f"same language on {same}/{len(words)} strings up to length 6")
