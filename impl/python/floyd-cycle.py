class Node:
    def __init__(self, val):
        self.val, self.next = val, None


def build_with_cycle(vals, pos):
    nodes = [Node(v) for v in vals]
    for a, b in zip(nodes, nodes[1:]):
        a.next = b
    if pos >= 0:
        nodes[-1].next = nodes[pos]  # 尾端接回第 pos 個節點形成環
    return nodes[0]


def has_cycle(head):
    """龜兔賽跑：兔子一次兩步、烏龜一次一步；有環時兩者必定相遇"""
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            return True, slow.val
    return False, None


vals = [3, 8, 1, 6, 9, 4, 7, 2, 5]
print("pos 3:", has_cycle(build_with_cycle(vals, 3)))
print("pos -1:", has_cycle(build_with_cycle(vals, -1)))
