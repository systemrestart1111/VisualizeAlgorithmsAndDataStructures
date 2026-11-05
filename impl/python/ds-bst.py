class Node:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None


class BST:
    """左子樹 < 節點 < 右子樹；搜尋、插入、刪除都只沿一條路徑往下"""

    def __init__(self):
        self.root = None

    def insert(self, v):
        if not self.root:
            self.root = Node(v)
            return
        cur = self.root
        while v != cur.val:
            if v < cur.val:
                if not cur.left:
                    cur.left = Node(v)
                cur = cur.left
            else:
                if not cur.right:
                    cur.right = Node(v)
                cur = cur.right

    def search(self, v):
        path, cur = [], self.root
        while cur:
            path.append(cur.val)
            if v == cur.val:
                return True, path
            cur = cur.left if v < cur.val else cur.right
        return False, path

    def min_max(self):
        lo = hi = self.root
        while lo.left:
            lo = lo.left
        while hi.right:
            hi = hi.right
        return lo.val, hi.val

    def delete(self, v):
        self.root = self._delete(self.root, v)

    def _delete(self, n, v):
        if not n:
            return None
        if v < n.val:
            n.left = self._delete(n.left, v)
        elif v > n.val:
            n.right = self._delete(n.right, v)
        else:
            if not n.left:
                return n.right  # 葉節點或只有右子
            if not n.right:
                return n.left
            s = n.right  # 兩個子節點：以中序後繼（右子樹最小值）取代
            while s.left:
                s = s.left
            n.val = s.val
            n.right = self._delete(n.right, s.val)
        return n


def inorder(n, out):
    if n:
        inorder(n.left, out); out.append(n.val); inorder(n.right, out)
    return out


def fmt(n):
    """括號表示法：值(左子樹,右子樹)，空子樹寫成 -"""
    if not n:
        return "-"
    if not n.left and not n.right:
        return str(n.val)
    return f"{n.val}({fmt(n.left)},{fmt(n.right)})"


t = BST()
for v in [50, 30, 70, 20, 40, 60, 80, 35, 65]:
    t.insert(v)
print("build:", fmt(t.root))
print("inorder:", " ".join(map(str, inorder(t.root, []))))
for v in [65, 45]:
    found, path = t.search(v)
    print(f"search {v}: {'found' if found else 'not found'}, path", " -> ".join(map(str, path)))
lo, hi = t.min_max()
print(f"min = {lo}, max = {hi}")
for v, kind in [(20, "leaf"), (30, "one child"), (50, "two children")]:
    t.delete(v)
    print(f"delete {v} ({kind}):", fmt(t.root))
print("inorder:", " ".join(map(str, inorder(t.root, []))))
