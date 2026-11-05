class Node:
    def __init__(self, val):
        self.val, self.left, self.right, self.h = val, None, None, 1


def height(n):
    return n.h if n else 0


def update(n):
    n.h = 1 + max(height(n.left), height(n.right))


def balance(n):
    """平衡因子 = 左子樹高 − 右子樹高，AVL 要求它在 −1..1 之間"""
    return height(n.left) - height(n.right)


def rotate_right(y):
    x = y.left
    y.left, x.right = x.right, y
    update(y); update(x)
    return x


def rotate_left(x):
    y = x.right
    x.right, y.left = y.left, x
    update(x); update(y)
    return y


def rebalance(n, log):
    update(n)
    b = balance(n)
    if b > 1:
        if balance(n.left) < 0:
            log.append(f"LR at {n.val}")
            n.left = rotate_left(n.left)
        else:
            log.append(f"LL at {n.val}")
        return rotate_right(n)
    if b < -1:
        if balance(n.right) > 0:
            log.append(f"RL at {n.val}")
            n.right = rotate_right(n.right)
        else:
            log.append(f"RR at {n.val}")
        return rotate_left(n)
    return n


def insert(n, v, log):
    if not n:
        return Node(v)
    if v < n.val:
        n.left = insert(n.left, v, log)
    elif v > n.val:
        n.right = insert(n.right, v, log)
    else:
        return n
    return rebalance(n, log)  # 遞迴返回時就是「沿路往上」檢查


def delete(n, v, log):
    if not n:
        return None
    if v < n.val:
        n.left = delete(n.left, v, log)
    elif v > n.val:
        n.right = delete(n.right, v, log)
    else:
        if not n.left or not n.right:
            return n.left or n.right
        s = n.right
        while s.left:
            s = s.left
        n.val = s.val
        n.right = delete(n.right, s.val, log)
    return rebalance(n, log)


def fmt(n):
    """括號表示法：值(左子樹,右子樹)，空子樹寫成 -"""
    if not n:
        return "-"
    if not n.left and not n.right:
        return str(n.val)
    return f"{n.val}({fmt(n.left)},{fmt(n.right)})"


def report(op, v, root, log):
    print(f"{op} {v:2d}: {fmt(root)}" + (f"   [{', '.join(log)}]" if log else ""))


root = None
for v in [40, 20, 60, 10, 30, 50, 70, 25, 27, 5, 4]:
    log = []
    root = insert(root, v, log)
    report("insert", v, root, log)
for v in [50, 70, 60]:
    log = []
    root = delete(root, v, log)
    report("delete", v, root, log)
print("height =", height(root))
