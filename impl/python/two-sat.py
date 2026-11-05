import sys

sys.setrecursionlimit(10000)


def neg(x):
    return x[1:] if x.startswith("!") else "!" + x


def two_sat(clauses):
    """(a ∨ b) ⇔ ¬a → b 且 ¬b → a；Tarjan 求 SCC，x 與 ¬x 同分量則無解"""
    vs = sorted({x.lstrip("!") for c in clauses for x in c})
    nodes = [y for v in vs for y in (v, "!" + v)]
    adj = {x: [] for x in nodes}
    for a, b in clauses:
        adj[neg(a)].append(b)
        adj[neg(b)].append(a)
    for x in adj:
        adj[x].sort()
    idx, low, comp, st, on = {}, {}, {}, [], set()
    t = c = 0

    def dfs(u):
        nonlocal t, c
        idx[u] = low[u] = t
        t += 1
        st.append(u)
        on.add(u)
        for v in adj[u]:
            if v not in idx:
                dfs(v)
                low[u] = min(low[u], low[v])
            elif v in on:
                low[u] = min(low[u], idx[v])
        if low[u] == idx[u]:
            while True:
                x = st.pop()
                on.discard(x)
                comp[x] = c
                if x == u:
                    break
            c += 1

    for u in nodes:
        if u not in idx:
            dfs(u)
    if any(comp[v] == comp["!" + v] for v in vs):
        return None
    return {v: comp[v] < comp["!" + v] for v in vs}  # Tarjan 的分量編號是反拓撲序


for text in ["a|b; !a|c; !b|!c; c|d; !d|!a", "a|b; a|!b; !a|b; !a|!b", "x|y; !x|y; !y|z"]:
    cl = [tuple(p.strip().split("|")) for p in text.split(";")]
    res = two_sat(cl)
    if res is None:
        print(text, "=> unsatisfiable")
        continue
    holds = lambda x: not res[x[1:]] if x.startswith("!") else res[x]
    ok = all(holds(a) or holds(b) for a, b in cl)
    print(text, "=>", " ".join(f"{v}={'T' if b else 'F'}" for v, b in res.items()), "| verified", ok)
