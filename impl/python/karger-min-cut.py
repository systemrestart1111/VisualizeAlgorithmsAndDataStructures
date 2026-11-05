EDGES = [("A", "B"), ("A", "C"), ("A", "D"), ("B", "C"), ("B", "D"), ("C", "D"), ("D", "E"), ("E", "F"), ("E", "G"), ("F", "G"), ("F", "H"), ("G", "H"), ("E", "H")]
NODES = ["A", "B", "C", "D", "E", "F", "G", "H"]


class Rng:
    def __init__(self, seed):
        self.s = seed

    def int(self, n):
        self.s = self.s * 48271 % 2147483647
        return self.s % n


def karger_trial(rng):
    """隨機縮邊直到剩兩個超節點；兩者之間的邊數就是一個割"""
    p = {v: v for v in NODES}

    def find(x):
        while p[x] != x:
            x = p[x]
        return x

    groups = len(NODES)
    while groups > 2:
        live = [i for i, (u, v) in enumerate(EDGES) if find(u) != find(v)]
        i = live[rng.int(len(live))]
        p[find(EDGES[i][0])] = find(EDGES[i][1])
        groups -= 1
    return sum(1 for u, v in EDGES if find(u) != find(v))


def brute_min_cut():
    n, best = len(NODES), len(EDGES)
    for m in range(1, 1 << (n - 1)):
        side = {v: (m >> i) & 1 for i, v in enumerate(NODES)}
        best = min(best, sum(1 for u, v in EDGES if side[u] != side[v]))
    return best


rng = Rng(42)
cuts = [karger_trial(rng) for _ in range(6)]
print("cuts per trial:", *cuts)
print("best:", min(cuts), "| brute force:", brute_min_cut())
