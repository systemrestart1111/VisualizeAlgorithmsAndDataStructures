class Node:
    def __init__(self, val):
        self.val, self.prev, self.next = val, None, None


class DoublyLinkedList:
    """每個節點同時記得前後；有 head 與 tail，兩端插入刪除都是 O(1)，也能反向走訪"""

    def __init__(self):
        self.head = self.tail = None

    def push_front(self, v):
        n = Node(v)
        n.next = self.head
        if self.head:
            self.head.prev = n
        else:
            self.tail = n
        self.head = n

    def push_back(self, v):
        n = Node(v)
        n.prev = self.tail
        if self.tail:
            self.tail.next = n
        else:
            self.head = n
        self.tail = n

    def unlink(self, n):
        """把節點 n 從前後鄰居之間拿掉"""
        if n.prev:
            n.prev.next = n.next
        else:
            self.head = n.next
        if n.next:
            n.next.prev = n.prev
        else:
            self.tail = n.prev
        return n.val

    def pop_front(self):
        return self.unlink(self.head)

    def pop_back(self):
        return self.unlink(self.tail)

    def remove(self, v):
        cur = self.head
        while cur and cur.val != v:
            cur = cur.next
        return cur is not None and self.unlink(cur) is not None

    def __str__(self):
        fwd, cur = [], self.head
        while cur:
            fwd.append(str(cur.val))
            cur = cur.next
        bwd, cur = [], self.tail
        while cur:
            bwd.append(str(cur.val))
            cur = cur.prev
        return f"{' <-> '.join(fwd) or '(empty)'}   | backward: {' '.join(bwd)}"


d = DoublyLinkedList()
for v in [10, 20, 30]:
    d.push_back(v)
print("init:         ", d)
d.push_front(5); print("push_front 5: ", d)
d.push_back(40); print("push_back 40: ", d)
print("pop_front ->", d.pop_front(), d)
print("pop_back  ->", d.pop_back(), d)
print("remove 20:    ", d.remove(20), d)
