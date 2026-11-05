class PersistentSegTree:
    """節點存在陣列中（sum, 左子, 右子）；更新只複製根到葉的路徑，其餘子樹共用"""

    def __init__(self, a):
        self.n, self.nodes = len(a), []
        self.roots = [self.build(a, 0, self.n - 1)]

    def mk(self, s, l=-1, r=-1):
        self.nodes.append((s, l, r))
        return len(self.nodes) - 1

    def build(self, a, lo, hi):
        if lo == hi:
            return self.mk(a[lo])
        m = (lo + hi) // 2
        L, R = self.build(a, lo, m), self.build(a, m + 1, hi)
        return self.mk(self.nodes[L][0] + self.nodes[R][0], L, R)

    def update(self, node, lo, hi, i, v):
        if lo == hi:
            return self.mk(v)
        s, L, R = self.nodes[node]
        m = (lo + hi) // 2
        if i <= m:
            L = self.update(L, lo, m, i, v)
        else:
            R = self.update(R, m + 1, hi, i, v)
        return self.mk(self.nodes[L][0] + self.nodes[R][0], L, R)

    def set(self, i, v):
        """以最新版本為基礎建立新版本"""
        self.roots.append(self.update(self.roots[-1], 0, self.n - 1, i, v))

    def query(self, ver, l, r, node=None, lo=0, hi=None):
        if node is None:
            node, hi = self.roots[ver], self.n - 1
        if r < lo or hi < l:
            return 0
        s, L, R = self.nodes[node]
        if l <= lo and hi <= r:
            return s
        m = (lo + hi) // 2
        return self.query(ver, l, r, L, lo, m) + self.query(ver, l, r, R, m + 1, hi)


t = PersistentSegTree([4, 1, 3, 5, 2, 6, 1, 3])
t.set(2, 7)
t.set(5, 0)
for ver in range(3):
    print(f"version {ver}: sum[0,7] = {t.query(ver, 0, 7)}, sum[2,5] = {t.query(ver, 2, 5)}")
print("total nodes:", len(t.nodes), "(15 + 4 + 4)")
