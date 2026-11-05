class Node:
    def __init__(self, val, nxt=None):
        self.val, self.next = val, nxt


def reverse(head):
    """三個指標 prev / cur / nxt：逐一把 cur.next 改指向前一個節點"""
    prev = None
    cur = head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev, cur = cur, nxt
    return prev


head = None
for v in reversed([1, 2, 3, 4, 5, 6]):
    head = Node(v, head)
head = reverse(head)
out = []
while head:
    out.append(str(head.val))
    head = head.next
print(" -> ".join(out))
