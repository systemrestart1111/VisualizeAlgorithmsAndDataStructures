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


def morris_inorder(root):
    """不用堆疊的中序走訪：暫時把左子樹最右節點的 right 指回自己（線索），走完再拆掉，O(1) 額外空間"""
    out, cur = [], root
    while cur:
        if cur.left is None:
            out.append(cur.val)
            cur = cur.right
        else:
            pre = cur.left
            while pre.right and pre.right is not cur:
                pre = pre.right
            if pre.right is None:  # 第一次到達：建立線索後往左
                pre.right = cur
                cur = cur.left
            else:                  # 第二次到達：左子樹已走完，拆除線索
                pre.right = None
                out.append(cur.val)
                cur = cur.right
    return out


print(*morris_inorder(build_level([6, 3, 9, 1, 4, 8, 11, None, 2, None, 5, 7])))
