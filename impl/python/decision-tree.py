class PM:
    def __init__(self, seed):
        self.s = seed

    def next(self):
        self.s = self.s * 48271 % 2147483647
        return self.s


def data(kind, seed=3):
    g, D = PM(seed), []
    for _ in range(30):
        x, y = g.next() % 1000 / 100, g.next() % 1000 / 100
        c = (1 if (x < 5) != (y < 5) else 0) if kind == "xor" else (1 if x + y > 10 else 0) if kind == "diag" else (2 if x > 6 else 1 if y > 5 else 0)
        D.append(((x, y), c))
    return D


def gini(D, idx):
    if not idx:
        return 0.0
    k = max(c for _, c in D) + 1
    cnt = [0] * k
    for i in idx:
        cnt[D[i][1]] += 1
    return 1 - sum((v / len(idx)) ** 2 for v in cnt)


def majority(D, idx):
    k = max(c for _, c in D) + 1
    cnt = [0] * k
    for i in idx:
        cnt[D[i][1]] += 1
    return cnt.index(max(cnt))


def build(D, idx, depth, max_depth, out, indent=""):
    """Gini 最低的切分；停止：純淨、達深度上限或樣本 < 2；平手取特徵小、門檻小"""
    g = gini(D, idx)
    if g < 1e-12 or depth >= max_depth or len(idx) < 2:
        out.append(f"{indent}leaf class {majority(D, idx)} (n={len(idx)})")
        return
    best = None
    for f in range(2):
        vals = sorted({D[i][0][f] for i in idx})
        for a, b in zip(vals, vals[1:]):
            t = (a + b) / 2
            L = [i for i in idx if D[i][0][f] <= t]
            R = [i for i in idx if D[i][0][f] > t]
            s = len(L) / len(idx) * gini(D, L) + len(R) / len(idx) * gini(D, R)
            if best is None or s < best[0] - 1e-12:
                best = (s, f, t, L, R)
    if best is None:
        out.append(f"{indent}leaf class {majority(D, idx)} (n={len(idx)})")
        return
    s, f, t, L, R = best
    out.append(f"{indent}x{f + 1} <= {t:.3f} (n={len(idx)}, gini {g:.3f} -> {s:.3f})")
    build(D, L, depth + 1, max_depth, out, indent + "  ")
    build(D, R, depth + 1, max_depth, out, indent + "  ")


for kind, depth in [("blocks", 2), ("xor", 2), ("xor", 3), ("diag", 3)]:
    D = data(kind)
    out = []
    build(D, list(range(len(D))), 0, depth, out)
    print(f"{kind}, max depth {depth}:")
    for line in out:
        print("  " + line)
