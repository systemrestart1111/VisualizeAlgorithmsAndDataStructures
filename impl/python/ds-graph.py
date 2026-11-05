from collections import deque

NAMES = "ABCDE"


class Graph:
    """無向加權圖，同時維護兩種表示法：鄰接矩陣 O(V²) 空間、鄰接串列 O(V + E) 空間"""

    def __init__(self, n):
        self.matrix = [[0] * n for _ in range(n)]
        self.adj = [[] for _ in range(n)]  # 每項為 (鄰居, 權重)

    def add_edge(self, u, v, w):
        self.matrix[u][v] = self.matrix[v][u] = w
        self.adj[u].append((v, w))
        self.adj[v].append((u, w))

    def remove_edge(self, u, v):
        self.matrix[u][v] = self.matrix[v][u] = 0
        self.adj[u] = [(x, w) for x, w in self.adj[u] if x != v]
        self.adj[v] = [(x, w) for x, w in self.adj[v] if x != u]

    def bfs(self, s):
        seen, order, q = {s}, [], deque([s])
        while q:
            u = q.popleft()
            order.append(u)
            for v, _ in self.adj[u]:
                if v not in seen:
                    seen.add(v)
                    q.append(v)
        return order

    def dfs(self, s, seen=None):
        seen = seen if seen is not None else set()
        seen.add(s)
        order = [s]
        for v, _ in self.adj[s]:
            if v not in seen:
                order += self.dfs(v, seen)
        return order

    def show(self):
        print("matrix:   " + " ".join(f"{c:>2}" for c in NAMES))
        for i, row in enumerate(self.matrix):
            print(f"        {NAMES[i]}", " ".join(f"{w:2d}" for w in row))
        print("list:")
        for i, lst in enumerate(self.adj):
            print(f"  {NAMES[i]} ->", " ".join(f"{NAMES[v]}({w})" for v, w in lst) or "-")


def idx(c):
    return NAMES.index(c)


g = Graph(5)
for u, v, w in [("A", "B", 4), ("A", "C", 2), ("B", "D", 5), ("C", "D", 8), ("D", "E", 3)]:
    g.add_edge(idx(u), idx(v), w)
g.show()
g.add_edge(idx("A"), idx("E"), 6); print("add edge A-E (6)")
g.remove_edge(idx("C"), idx("D")); print("remove edge C-D")
g.show()
print("BFS from A:", " ".join(NAMES[i] for i in g.bfs(0)))
print("DFS from A:", " ".join(NAMES[i] for i in g.dfs(0)))
