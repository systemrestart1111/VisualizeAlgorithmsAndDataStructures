from collections import deque

TOKENS = [3, 4, 5, 1, 3, None, 1, 2, None, 6, None, 4]  # 層序表示的二元樹，數字為權重


class Node:
    def __init__(self, w):
        self.w, self.left, self.right = w, None, None


def build(tokens):
    root = Node(tokens[0])
    q, i = deque([root]), 1
    while q and i < len(tokens):
        n = q.popleft()
        for side in ("left", "right"):
            if i < len(tokens):
                if tokens[i] is not None:
                    setattr(n, side, Node(tokens[i]))
                    q.append(getattr(n, side))
                i += 1
    return root


def solve(n):
    """回傳 (選 n 的最大權重, 不選 n 的最大權重)；選了 n 就不能選它的孩子"""
    if n is None:
        return 0, 0
    l, r = solve(n.left), solve(n.right)
    take = n.w + l[1] + r[1]
    skip = max(l) + max(r)
    return take, skip


take, skip = solve(build(TOKENS))
print("take root:", take, "skip root:", skip)
print("max independent set weight =", max(take, skip))
