class Node:
    def __init__(self, val, nxt=None):
        self.val, self.next = val, nxt


def middle(head):
    """快慢指標：fast 一次走兩步、slow 一次走一步，fast 到尾時 slow 在中點"""
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow


head = None
for v in reversed([3, 7, 1, 9, 4, 8, 2]):
    head = Node(v, head)
print("middle =", middle(head).val)
