class Node:
    def __init__(self, val, nxt=None):
        self.val, self.next = val, nxt


class SinglyLinkedList:
    """每個節點只記得下一個；頭部插入刪除 O(1)，找特定位置要從頭走 O(n)"""

    def __init__(self):
        self.head, self.size = None, 0

    def push_front(self, v):
        self.head = Node(v, self.head)
        self.size += 1

    def push_back(self, v):
        if not self.head:
            self.push_front(v)
            return
        cur = self.head
        while cur.next:
            cur = cur.next
        cur.next = Node(v)
        self.size += 1

    def remove(self, v):
        """刪除第一個值為 v 的節點：讓前一個節點跳過它"""
        prev, cur = None, self.head
        while cur and cur.val != v:
            prev, cur = cur, cur.next
        if not cur:
            return False
        if prev:
            prev.next = cur.next
        else:
            self.head = cur.next
        self.size -= 1
        return True

    def find(self, v):
        cur, i = self.head, 0
        while cur:
            if cur.val == v:
                return i
            cur, i = cur.next, i + 1
        return -1

    def __str__(self):
        out, cur = [], self.head
        while cur:
            out.append(str(cur.val))
            cur = cur.next
        return " -> ".join(out + ["null"])


lst = SinglyLinkedList()
for v in [3, 7, 1]:
    lst.push_back(v)
print("init:        ", lst)
lst.push_front(9); print("push_front 9:", lst)
lst.push_back(4); print("push_back 4: ", lst)
print("remove 7:    ", lst.remove(7), lst)
print("find 1 ->", lst.find(1), " find 8 ->", lst.find(8), " size =", lst.size)
