class Node:
    def __init__(self, val, nxt=None):
        self.val, self.next = val, nxt


def remove_kth_from_end(head, k):
    """fast 先走 k 步，之後 fast、slow 一起走；fast 到尾時 slow.next 就是倒數第 k 個"""
    dummy = Node(0, head)
    fast = slow = dummy
    for _ in range(k):
        fast = fast.next
    while fast.next:
        fast, slow = fast.next, slow.next
    removed = slow.next.val
    slow.next = slow.next.next
    return dummy.next, removed


head = None
for v in reversed([10, 20, 30, 40, 50, 60, 70]):
    head = Node(v, head)
head, removed = remove_kth_from_end(head, 3)
out = []
while head:
    out.append(str(head.val))
    head = head.next
print("removed", removed, ":", " -> ".join(out))
