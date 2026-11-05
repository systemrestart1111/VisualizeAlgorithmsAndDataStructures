class Node:
    def __init__(self, val):
        self.val, self.next = val, None


def cycle_entry(head):
    """相遇後把一個指標放回起點，兩者都改成一次一步，再次相遇處就是環的入口"""
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            break
    else:
        return None, 0
    p = head
    while p is not slow:
        p, slow = p.next, slow.next
    length, q = 1, p.next
    while q is not p:
        q, length = q.next, length + 1
    return p.val, length


nodes = [Node(v) for v in [3, 8, 1, 6, 9, 4, 7, 2, 5]]
for a, b in zip(nodes, nodes[1:]):
    a.next = b
nodes[-1].next = nodes[3]
entry, length = cycle_entry(nodes[0])
print("entry =", entry, "cycle length =", length)
