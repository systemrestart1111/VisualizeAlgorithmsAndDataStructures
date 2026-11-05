EVENTS = "+ 1 2; + 2 3; ? 1 3; + 4 5; - 2 3; ? 1 3; + 3 4; ? 1 5; + 1 3; ? 2 5; - 1 2; ? 2 5"
ev = [tuple(s.split()) for s in EVENTS.split("; ")]
T = len(ev)
key = lambda a, b: (min(a, b), max(a, b))

# 1. 每條邊的存活區間
open_, spans = {}, []
for t, (op, a, b) in enumerate(ev):
    k = key(a, b)
    if op == "+" and k not in open_:
        open_[k] = t
    elif op == "-" and k in open_:
        spans.append((k, open_.pop(k), t - 1))
spans += [(k, l, T - 1) for k, l in open_.items()]

# 2. 掛到時間線段樹上
seg = {}


def insert(o, l, r, ql, qr, e):
    if qr < l or r < ql or ql > qr:
        return
    if ql <= l and r <= qr:
        seg.setdefault(o, []).append(e)
        return
    m = (l + r) // 2
    insert(2 * o, l, m, ql, qr, e)
    insert(2 * o + 1, m + 1, r, ql, qr, e)


for e, l, r in spans:
    insert(1, 0, T - 1, l, r, e)

# 3. DFS 線段樹 + 可回滾並查集（依大小合併、不壓縮路徑）
parent, size, hist, answers = {}, {}, [], {}


def find(x):
    parent.setdefault(x, x)
    size.setdefault(x, 1)
    while parent[x] != x:
        x = parent[x]
    return x


def dfs(o, l, r):
    before = len(hist)
    for a, b in seg.get(o, []):
        ra, rb = find(a), find(b)
        if ra != rb:
            if size[ra] > size[rb]:
                ra, rb = rb, ra
            parent[ra] = rb
            size[rb] += size[ra]
            hist.append((ra, rb))
    if l == r:
        op, a, b = ev[l]
        if op == "?":
            answers[l] = find(a) == find(b)
    else:
        m = (l + r) // 2
        dfs(2 * o, l, m)
        dfs(2 * o + 1, m + 1, r)
    while len(hist) > before:
        ra, rb = hist.pop()
        parent[ra] = ra
        size[rb] -= size[ra]


dfs(1, 0, T - 1)
for t in sorted(answers):
    _, a, b = ev[t]
    print(f"t={t} ? {a} {b}: {'connected' if answers[t] else 'not connected'}")
