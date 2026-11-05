class Node:
    def __init__(self, val, nxt=None):
        self.val, self.next = val, nxt


def build(vals):
    head = None
    for v in reversed(vals):
        head = Node(v, head)
    return head


def merge(a, b):
    """用虛擬頭節點 dummy；每次把較小的節點接到尾端"""
    dummy = tail = Node(0)
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next


h = merge(build([1, 4, 7, 10, 15]), build([2, 3, 8, 12, 20, 25]))
out = []
while h:
    out.append(str(h.val))
    h = h.next
print(" -> ".join(out))
