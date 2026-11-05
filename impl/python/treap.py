class Rng:
    """與網頁相同的 Park–Miller 亂數，固定種子讓結果可重現"""

    def __init__(self, seed):
        self.s = seed

    def int(self, n):
        self.s = self.s * 48271 % 2147483647
        return self.s % n


class Node:
    def __init__(self, key, pri):
        self.key, self.pri, self.left, self.right = key, pri, None, None


rng = Rng(2024)


def rot_right(n):
    l = n.left
    n.left, l.right = l.right, n
    return l


def rot_left(n):
    r = n.right
    n.right, r.left = r.left, n
    return r


def insert(n, key):
    """依 BST 插到葉子，回溯時若子節點優先權較高就旋轉上來（最大堆積）"""
    if n is None:
        return Node(key, rng.int(100))
    if key == n.key:
        return n
    if key < n.key:
        n.left = insert(n.left, key)
        if n.left.pri > n.pri:
            n = rot_right(n)
    else:
        n.right = insert(n.right, key)
        if n.right.pri > n.pri:
            n = rot_left(n)
    return n


def delete(n, key):
    """把節點往優先權較高的子節點方向轉下去，直到最多一個子節點再移除"""
    if n is None:
        return None
    if key < n.key:
        n.left = delete(n.left, key)
    elif key > n.key:
        n.right = delete(n.right, key)
    else:
        if n.left is None or n.right is None:
            return n.left or n.right
        if n.left.pri > n.right.pri:
            n = rot_right(n)
            n.right = delete(n.right, key)
        else:
            n = rot_left(n)
            n.left = delete(n.left, key)
    return n


def preorder(n):
    return [] if n is None else [f"{n.key}(p{n.pri})"] + preorder(n.left) + preorder(n.right)


def inorder(n):
    return [] if n is None else inorder(n.left) + [n.key] + inorder(n.right)


root = None
for k in [30, 15, 45, 8, 22, 37, 52]:
    root = insert(root, k)
print("preorder:", *preorder(root))
print("inorder :", *inorder(root))
for k in [30, 8]:
    root = delete(root, k)
print("after delete 30, 8:", *preorder(root))
print("inorder :", *inorder(root))
