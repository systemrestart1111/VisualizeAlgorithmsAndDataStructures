class Node:
    def __init__(self, k=0, v=0):
        self.k, self.v, self.prev, self.next = k, v, None, None


class LRUCache:
    """雜湊表 + 雙向鏈結串列：頭端最近使用，尾端最久未用"""

    def __init__(self, cap):
        self.cap, self.map = cap, {}
        self.head, self.tail = Node(), Node()
        self.head.next, self.tail.prev = self.tail, self.head

    def _unlink(self, n):
        n.prev.next, n.next.prev = n.next, n.prev

    def _push_front(self, n):
        n.prev, n.next = self.head, self.head.next
        self.head.next.prev = n
        self.head.next = n

    def get(self, k):
        if k not in self.map:
            return -1
        n = self.map[k]
        self._unlink(n)
        self._push_front(n)
        return n.v

    def put(self, k, v):
        if self.cap == 0:
            return
        if k in self.map:
            n = self.map[k]
            n.v = v
            self._unlink(n)
            self._push_front(n)
            return
        if len(self.map) == self.cap:
            old = self.tail.prev
            self._unlink(old)
            del self.map[old.k]
        n = Node(k, v)
        self.map[k] = n
        self._push_front(n)

    def order(self):
        out, n = [], self.head.next
        while n is not self.tail:
            out.append(f"{n.k}:{n.v}")
            n = n.next
        return " ".join(out)


c = LRUCache(2)
c.put(1, 1)
c.put(2, 2)
print("get 1 ->", c.get(1))
c.put(3, 3)
print("get 2 ->", c.get(2))
c.put(4, 4)
print("get 1 ->", c.get(1), "| get 3 ->", c.get(3), "| get 4 ->", c.get(4))
c.put(3, 33)
print("order:", c.order())
z = LRUCache(0)
z.put(1, 1)
print("cap 0 get 1 ->", z.get(1))
