class Node:
    def __init__(self, val, red, nil=None):
        self.val, self.red = val, red
        self.left = self.right = self.parent = nil


class RedBlackTree:
    """CLRS 版本：以一個黑色哨兵 NIL 代替所有空指標，插入後以「變色 + 旋轉」修復"""

    def __init__(self):
        self.NIL = Node(None, False)
        self.NIL.left = self.NIL.right = self.NIL.parent = self.NIL
        self.root = self.NIL

    def _rotate_left(self, x):
        y = x.right
        x.right = y.left
        if y.left is not self.NIL:
            y.left.parent = x
        y.parent = x.parent
        if x.parent is self.NIL:
            self.root = y
        elif x is x.parent.left:
            x.parent.left = y
        else:
            x.parent.right = y
        y.left, x.parent = x, y

    def _rotate_right(self, x):
        y = x.left
        x.left = y.right
        if y.right is not self.NIL:
            y.right.parent = x
        y.parent = x.parent
        if x.parent is self.NIL:
            self.root = y
        elif x is x.parent.right:
            x.parent.right = y
        else:
            x.parent.left = y
        y.right, x.parent = x, y

    def insert(self, v):
        z = Node(v, True, self.NIL)  # 新節點一律為紅色
        y, x = self.NIL, self.root
        while x is not self.NIL:
            y = x
            x = x.left if v < x.val else x.right
        z.parent = y
        if y is self.NIL:
            self.root = z
        elif v < y.val:
            y.left = z
        else:
            y.right = z
        return self._fix(z)

    def _fix(self, z):
        log = []
        while z.parent.red:  # 違反「紅節點的子節點必為黑」
            g = z.parent.parent
            left = z.parent is g.left
            u = g.right if left else g.left
            if u.red:  # Case 1：叔叔紅 → 父、叔變黑，祖父變紅，往上繼續
                z.parent.red = u.red = False
                g.red = True
                z = g
                log.append("case 1")
                continue
            if z is (z.parent.right if left else z.parent.left):  # Case 2：內側 → 轉成外側
                z = z.parent
                self._rotate_left(z) if left else self._rotate_right(z)
                log.append("case 2")
            z.parent.red, g.red = False, True  # Case 3：外側 → 變色後旋轉祖父
            self._rotate_right(g) if left else self._rotate_left(g)
            log.append("case 3")
        self.root.red = False
        return log

    def search(self, v):
        path, cur = [], self.root
        while cur is not self.NIL:
            path.append(cur.val)
            if v == cur.val:
                return True, path
            cur = cur.left if v < cur.val else cur.right
        return False, path

    def black_height(self, n):
        """回傳黑高（含 NIL）；若違反紅黑性質則回傳 -1"""
        if n is self.NIL:
            return 1
        if n.red and (n.left.red or n.right.red):
            return -1
        l, r = self.black_height(n.left), self.black_height(n.right)
        if l < 0 or l != r:
            return -1
        return l + (0 if n.red else 1)

    def fmt(self, n):
        """值後面標 R／B 表示紅／黑；括號內為 (左子樹,右子樹)"""
        if n is self.NIL:
            return "-"
        s = f"{n.val}{'R' if n.red else 'B'}"
        if n.left is self.NIL and n.right is self.NIL:
            return s
        return f"{s}({self.fmt(n.left)},{self.fmt(n.right)})"


t = RedBlackTree()
for v in [41, 38, 31, 12, 19, 8, 45, 50, 55]:
    log = t.insert(v)
    print(f"insert {v}: {t.fmt(t.root)}" + (f"   [{', '.join(log)}]" if log else ""))
for v in [19, 40]:
    found, path = t.search(v)
    print(f"search {v}: {'found' if found else 'not found'}, path", " -> ".join(map(str, path)))
print("black height =", t.black_height(t.root), "(-1 means invalid)")
