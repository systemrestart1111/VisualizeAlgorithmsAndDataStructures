class Node:
    def __init__(self, val, nxt=None):
        self.val, self.next = val, nxt


def build(vals):
    head = None
    for v in reversed(vals):
        head = Node(v, head)
    return head


def to_str(head):
    out = []
    while head:
        out.append(str(head.val))
        head = head.next
    return " -> ".join(out)


def insert_at(head, i, v):
    """在位置 i 插入：找到第 i-1 個節點，新節點先接上後繼，再讓前驅指向新節點"""
    if i == 0:
        return Node(v, head)
    prev = head
    for _ in range(i - 1):
        prev = prev.next
    prev.next = Node(v, prev.next)
    return head


def delete_at(head, i):
    """刪除位置 i：讓前驅直接跳過該節點"""
    if i == 0:
        return head.next
    prev = head
    for _ in range(i - 1):
        prev = prev.next
    prev.next = prev.next.next
    return head


head = build([10, 20, 30, 40, 50])
head = insert_at(head, 2, 99)
print("insert 99 at 2:", to_str(head))
head = delete_at(head, 4)
print("delete at 4:  ", to_str(head))
