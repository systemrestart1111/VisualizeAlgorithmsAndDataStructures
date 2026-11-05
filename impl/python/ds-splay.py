class Node:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None


def rotate_right(x):
    y = x.left
    x.left, y.right = y.right, x
    return y


def rotate_left(x):
    y = x.right
    x.right, y.left = y.left, x
    return y


def splay(root, k):
    """把 k 轉到根；k 不存在時，轉上來的是搜尋路徑上最後一個節點"""
    if not root or root.val == k:
        return root
    if k < root.val:
        if not root.left:
            return root
        if k < root.left.val:  # Zig-Zig（左左）：先轉祖父
            root.left.left = splay(root.left.left, k)
            root = rotate_right(root)
        elif k > root.left.val:  # Zig-Zag（左右）
            root.left.right = splay(root.left.right, k)
            if root.left.right:
                root.left = rotate_left(root.left)
        return rotate_right(root) if root.left else root
    if not root.right:
        return root
    if k > root.right.val:  # Zig-Zig（右右）
        root.right.right = splay(root.right.right, k)
        root = rotate_left(root)
    elif k < root.right.val:  # Zig-Zag（右左）
        root.right.left = splay(root.right.left, k)
        if root.right.left:
            root.right = rotate_right(root.right)
    return rotate_left(root) if root.right else root


class SplayTree:
    """每次存取後都把該節點轉到根；不存任何平衡資訊，均攤 O(log n)"""

    def __init__(self):
        self.root = None

    def insert(self, k):
        if not self.root:
            self.root = Node(k)
            return
        cur = self.root
        while k != cur.val:  # 先做一般 BST 插入
            nxt = cur.left if k < cur.val else cur.right
            if not nxt:
                nxt = Node(k)
                if k < cur.val:
                    cur.left = nxt
                else:
                    cur.right = nxt
            cur = nxt
        self.root = splay(self.root, k)

    def search(self, k):
        self.root = splay(self.root, k)
        return self.root is not None and self.root.val == k

    def delete(self, k):
        if not self.search(k):
            return False
        if not self.root.left:
            self.root = self.root.right
        else:
            right = self.root.right
            self.root = splay(self.root.left, k)  # 左子樹最大值轉到根，它沒有右子
            self.root.right = right
        return True


def fmt(n):
    """括號表示法：值(左子樹,右子樹)，空子樹寫成 -"""
    if not n:
        return "-"
    if not n.left and not n.right:
        return str(n.val)
    return f"{n.val}({fmt(n.left)},{fmt(n.right)})"


def b(x):
    return "True" if x else "False"


t = SplayTree()
for v in [50, 30, 70, 20, 40, 60, 80]:
    t.insert(v)
    print(f"insert {v}: {fmt(t.root)}")
for v in [40, 65]:
    found = t.search(v)
    print(f"search {v} -> {b(found)}: {fmt(t.root)}")
for v in [30, 99]:
    ok = t.delete(v)
    print(f"delete {v} -> {b(ok)}: {fmt(t.root)}")
