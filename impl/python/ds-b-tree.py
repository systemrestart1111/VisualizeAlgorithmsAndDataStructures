T = 2  # 最小度數：每個節點 T-1 ~ 2T-1 個鍵（T = 2 即 2-3-4 樹）


class BNode:
    def __init__(self, leaf):
        self.keys, self.kids, self.leaf = [], [], leaf


class BTree:
    """所有葉節點在同一深度；往下插入時遇到滿節點就先分裂（預先分裂，不必回頭）"""

    def __init__(self):
        self.root = BNode(True)

    def _split(self, x, i):
        y = x.kids[i]
        z = BNode(y.leaf)
        mid = y.keys[T - 1]  # 中間鍵上移到父節點
        z.keys, y.keys = y.keys[T:], y.keys[:T - 1]
        if not y.leaf:
            z.kids, y.kids = y.kids[T:], y.kids[:T]
        x.keys.insert(i, mid)
        x.kids.insert(i + 1, z)

    def insert(self, k):
        if len(self.root.keys) == 2 * T - 1:  # 根滿了：樹長高一層
            s = BNode(False)
            s.kids = [self.root]
            self.root = s
            self._split(s, 0)
        x = self.root
        while not x.leaf:
            i = 0
            while i < len(x.keys) and k > x.keys[i]:
                i += 1
            if len(x.kids[i].keys) == 2 * T - 1:
                self._split(x, i)
                if k > x.keys[i]:
                    i += 1
            x = x.kids[i]
        i = 0
        while i < len(x.keys) and x.keys[i] < k:
            i += 1
        x.keys.insert(i, k)

    def search(self, k):
        x, path = self.root, []
        while True:
            path.append(node_str(x))
            i = 0
            while i < len(x.keys) and k > x.keys[i]:
                i += 1
            if i < len(x.keys) and x.keys[i] == k:
                return True, path
            if x.leaf:
                return False, path
            x = x.kids[i]

    def levels(self):
        out, level = [], [self.root]
        while level:
            out.append(level)
            level = [c for n in level for c in n.kids]
        return out


def node_str(n):
    return "[" + " ".join(map(str, n.keys)) + "]"


def show(t):
    """逐層列出節點，層與層之間以 / 分隔"""
    return " / ".join(" ".join(node_str(n) for n in lvl) for lvl in t.levels())


t = BTree()
for k in [10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 28]:
    t.insert(k)
    print(f"insert {k:2d}:", show(t))
for k in [17, 13]:
    found, path = t.search(k)
    print(f"search {k}: {'found' if found else 'not found'}, path", " -> ".join(path))
print("height =", len(t.levels()))
