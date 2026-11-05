from collections import deque


class Node:
    def __init__(self, val, parent=None):
        self.val, self.left, self.right, self.parent = val, None, None, parent


class BinaryTree:
    """依層序插入，形狀維持完全二元樹；刪除時以最深最右的節點補位"""

    def __init__(self):
        self.root = None

    def level_order(self):
        out, q = [], deque([self.root] if self.root else [])
        while q:
            n = q.popleft()
            out.append(n)
            if n.left:
                q.append(n.left)
            if n.right:
                q.append(n.right)
        return out

    def insert(self, v):
        if not self.root:
            self.root = Node(v)
            return
        for n in self.level_order():  # 第一個缺少子節點的位置
            if not n.left:
                n.left = Node(v, n)
                return
            if not n.right:
                n.right = Node(v, n)
                return

    def delete(self, v):
        nodes = self.level_order()
        target = next((n for n in nodes if n.val == v), None)
        if not target:
            return False
        deepest = nodes[-1]
        target.val = deepest.val
        p = deepest.parent
        if p is None:
            self.root = None
        elif p.right is deepest:
            p.right = None
        else:
            p.left = None
        return True


def preorder(n, out):
    if n:
        out.append(n.val); preorder(n.left, out); preorder(n.right, out)
    return out


def inorder(n, out):
    if n:
        inorder(n.left, out); out.append(n.val); inorder(n.right, out)
    return out


def postorder(n, out):
    if n:
        postorder(n.left, out); postorder(n.right, out); out.append(n.val)
    return out


def fmt(n):
    """括號表示法：值(左子樹,右子樹)，空子樹寫成 -"""
    if not n:
        return "-"
    if not n.left and not n.right:
        return str(n.val)
    return f"{n.val}({fmt(n.left)},{fmt(n.right)})"


def show(name, vals):
    print(f"{name:<10}", " ".join(map(str, vals)))


t = BinaryTree()
for v in range(1, 9):
    t.insert(v)
print("insert 1..8:", fmt(t.root))
show("preorder:", preorder(t.root, []))
show("inorder:", inorder(t.root, []))
show("postorder:", postorder(t.root, []))
show("level:", [n.val for n in t.level_order()])
t.delete(2)
print("delete 2:", fmt(t.root))
show("level:", [n.val for n in t.level_order()])
