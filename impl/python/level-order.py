from collections import deque


class Node:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None


def build_level(tokens):
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


def level_order(root):
    """BFS：用佇列一層一層處理，每層開始時佇列長度就是這一層的節點數"""
    levels, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):
            n = q.popleft()
            level.append(n.val)
            if n.left:
                q.append(n.left)
            if n.right:
                q.append(n.right)
        levels.append(level)
    return levels


for d, level in enumerate(level_order(build_level([1, 2, 3, 4, 5, 6, 7, None, 8, 9, None, None, 10]))):
    print(f"level {d}:", *level)
