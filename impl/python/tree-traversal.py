from collections import deque


class Node:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None


def build_level(tokens):
    """依層序建樹，None 表示空節點"""
    root = Node(tokens[0])
    q, i = deque([root]), 1
    while q and i < len(tokens):
        n = q.popleft()
        for side in ("left", "right"):
            if i < len(tokens):
                if tokens[i] is not None:
                    child = Node(tokens[i])
                    setattr(n, side, child)
                    q.append(child)
                i += 1
    return root


def preorder(n, out):   # 根 → 左 → 右
    if n:
        out.append(n.val); preorder(n.left, out); preorder(n.right, out)


def inorder(n, out):    # 左 → 根 → 右
    if n:
        inorder(n.left, out); out.append(n.val); inorder(n.right, out)


def postorder(n, out):  # 左 → 右 → 根
    if n:
        postorder(n.left, out); postorder(n.right, out); out.append(n.val)


root = build_level([1, 2, 3, 4, 5, 6, 7, None, 8, 9, None, None, 10])
for name, f in (("pre", preorder), ("in", inorder), ("post", postorder)):
    out = []
    f(root, out)
    print(f"{name}:", *out)
