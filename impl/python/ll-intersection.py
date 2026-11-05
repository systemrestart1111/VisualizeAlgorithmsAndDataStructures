class Node:
    def __init__(self, val, nxt=None):
        self.val, self.next = val, nxt


def build(vals, tail=None):
    head = tail
    for v in reversed(vals):
        head = Node(v, head)
    return head


def intersection(a, b):
    """兩指標各走自己的串列，走到尾就跳到另一條的開頭；兩者走過的總長相同，會在交點相遇"""
    p, q = a, b
    while p is not q:
        p = p.next if p else b
        q = q.next if q else a
    return p


common = build([8, 10, 12])
A = build([4, 1, 7], common)
B = build([5, 6, 2, 9, 3], common)
node = intersection(A, B)
print("intersection at", node.val if node else None)
