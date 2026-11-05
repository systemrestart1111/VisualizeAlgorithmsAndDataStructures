class Node:
    def __init__(self, key):
        self.key, self.left, self.right = key, None, None


def insert(root, key):
    """插入二元搜尋樹：小於往左、其餘往右"""
    if root is None:
        return Node(key)
    if key < root.key:
        root.left = insert(root.left, key)
    else:
        root.right = insert(root.right, key)
    return root


def inorder(root, out):
    """中序走訪 BST 會得到遞增序列"""
    if root:
        inorder(root.left, out)
        out.append(root.key)
        inorder(root.right, out)


a = [50, 30, 70, 20, 40, 60, 80, 35, 65, 10, 45]
root = None
for x in a:
    root = insert(root, x)
out = []
inorder(root, out)
print(*out)
