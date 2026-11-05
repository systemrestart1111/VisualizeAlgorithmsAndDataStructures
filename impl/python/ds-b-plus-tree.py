M = 4  # 階數：節點的鍵數達到 M 就分裂


class BPNode:
    def __init__(self, leaf):
        self.keys, self.kids, self.leaf, self.next = [], [], leaf, None


class BPlusTree:
    """資料都在葉節點、內部節點只放索引鍵；葉節點以 next 串成串列，範圍查詢只需沿串列走"""

    def __init__(self):
        self.root = BPNode(True)

    def _find_leaf(self, k):
        x, path = self.root, [self.root]
        while not x.leaf:
            i = 0
            while i < len(x.keys) and k >= x.keys[i]:
                i += 1
            x = x.kids[i]
            path.append(x)
        return x, path

    def insert(self, k):
        leaf, path = self._find_leaf(k)
        if k in leaf.keys:
            return
        i = 0
        while i < len(leaf.keys) and leaf.keys[i] < k:
            i += 1
        leaf.keys.insert(i, k)
        node, d = leaf, len(path) - 1
        while len(node.keys) >= M:
            nw = BPNode(node.leaf)
            mid = (len(node.keys) + 1) // 2
            if node.leaf:  # 葉分裂：右半第一個鍵「複製」到父節點
                nw.keys, node.keys = node.keys[mid:], node.keys[:mid]
                nw.next, node.next = node.next, nw
                up = nw.keys[0]
            else:  # 內部分裂：中間鍵「移動」到父節點
                up = node.keys[mid - 1]
                nw.keys, nw.kids = node.keys[mid:], node.kids[mid:]
                node.keys, node.kids = node.keys[:mid - 1], node.kids[:mid]
            if d == 0:  # 分裂到根：樹長高一層
                self.root = BPNode(False)
                self.root.keys, self.root.kids = [up], [node, nw]
                break
            parent = path[d - 1]
            pi = parent.kids.index(node)
            parent.keys.insert(pi, up)
            parent.kids.insert(pi + 1, nw)
            node, d = parent, d - 1

    def search(self, k):
        return k in self._find_leaf(k)[0].keys

    def range(self, a, b):
        out, x = [], self._find_leaf(a)[0]
        while x:
            out += [k for k in x.keys if a <= k <= b]
            if x.keys and x.keys[-1] > b:
                break
            x = x.next
        return out

    def levels(self):
        out, level = [], [self.root]
        while level:
            out.append(level)
            level = [c for n in level for c in n.kids]
        return out

    def leaves(self):
        x = self.root
        while not x.leaf:
            x = x.kids[0]
        out = []
        while x:
            out.append(x)
            x = x.next
        return out


def node_str(n):
    return "[" + " ".join(map(str, n.keys)) + "]"


def b(x):
    return "True" if x else "False"


t = BPlusTree()
for k in [5, 15, 25, 35, 45, 10, 20, 30, 40, 50, 12, 28]:
    t.insert(k)
    print(f"insert {k:2d}:", " / ".join(" ".join(node_str(n) for n in lvl) for lvl in t.levels()))
print("leaves:", " -> ".join(node_str(n) for n in t.leaves()))
print("search 28 ->", b(t.search(28)), " search 33 ->", b(t.search(33)))
print("range [12, 35]:", " ".join(map(str, t.range(12, 35))))
