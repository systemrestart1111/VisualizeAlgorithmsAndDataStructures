class Node:
    def __init__(self, key):
        self.key, self.h, self.size, self.left, self.right = key, 1, 1, None, None


H = lambda n: n.h if n else 0
S = lambda n: n.size if n else 0


def fix(n):
    n.h = 1 + max(H(n.left), H(n.right))
    n.size = 1 + S(n.left) + S(n.right)


def rot_right(n):
    l = n.left
    n.left, l.right = l.right, n
    fix(n), fix(l)
    return l


def rot_left(n):
    r = n.right
    n.right, r.left = r.left, n
    fix(n), fix(r)
    return r


def balance(n):
    """AVL 平衡；旋轉後重新計算子樹大小"""
    fix(n)
    if H(n.left) - H(n.right) > 1:
        if H(n.left.left) < H(n.left.right):
            n.left = rot_left(n.left)
        return rot_right(n)
    if H(n.right) - H(n.left) > 1:
        if H(n.right.right) < H(n.right.left):
            n.right = rot_right(n.right)
        return rot_left(n)
    return n


def insert(n, k):
    if n is None:
        return Node(k)
    if k < n.key:
        n.left = insert(n.left, k)
    else:
        n.right = insert(n.right, k)
    return balance(n)


def delete(n, k):
    if n is None:
        return None
    if k < n.key:
        n.left = delete(n.left, k)
    elif k > n.key:
        n.right = delete(n.right, k)
    else:
        if n.left is None or n.right is None:
            return n.left or n.right
        m = n.right
        while m.left:
            m = m.left
        n.key = m.key
        n.right = delete(n.right, m.key)
    return balance(n)


def select(n, k):
    """第 k 小（1 起算）：比較 k 與左子樹大小"""
    while n:
        ls = S(n.left)
        if k == ls + 1:
            return n.key
        if k <= ls:
            n = n.left
        else:
            k -= ls + 1
            n = n.right


def rank(n, x):
    """比 x 小的個數 + 1"""
    r = 0
    while n:
        if x <= n.key:
            n = n.left
        else:
            r += S(n.left) + 1
            n = n.right
    return r + 1


root = None
for k in [20, 10, 30, 5, 15, 25, 40, 12, 35, 1]:
    root = insert(root, k)
print("select 1..n:", *[select(root, k) for k in range(1, S(root) + 1)])
print("rank 13 =", rank(root, 13), "| rank 26 =", rank(root, 26), "| rank 0 =", rank(root, 0))
print("root:", root.key, "size", root.size, "height", root.h)
for k in [20, 5]:
    root = delete(root, k)
print("after delete 20, 5:", *[select(root, k) for k in range(1, S(root) + 1)])
print("select 4 =", select(root, 4), "| rank 30 =", rank(root, 30))
