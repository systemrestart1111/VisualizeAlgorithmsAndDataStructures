class Node:
    def __init__(self, val):
        self.val, self.next = val, None


class CircularLinkedList:
    """尾節點的 next 指回頭節點；只要記住 tail，就能 O(1) 取得頭（tail.next）並在兩端插入"""

    def __init__(self):
        self.tail = None

    def insert_back(self, v):
        n = Node(v)
        if not self.tail:
            n.next = n
        else:
            n.next = self.tail.next
            self.tail.next = n
        self.tail = n

    def remove(self, v):
        if not self.tail:
            return False
        prev, cur = self.tail, self.tail.next
        while True:
            if cur.val == v:
                if cur is prev:  # 只剩一個節點
                    self.tail = None
                else:
                    prev.next = cur.next
                    if cur is self.tail:
                        self.tail = prev
                return True
            prev, cur = cur, cur.next
            if cur is self.tail.next:
                return False

    def rotate(self):
        """把頭移到尾：只要 tail 往前走一步"""
        if self.tail:
            self.tail = self.tail.next

    def __str__(self):
        if not self.tail:
            return "(empty)"
        out, cur = [], self.tail.next
        while True:
            out.append(str(cur.val))
            if cur is self.tail:
                break
            cur = cur.next
        return " -> ".join(out) + f" -> (back to {self.tail.next.val})"


c = CircularLinkedList()
for v in [1, 2, 3, 4]:
    c.insert_back(v)
print("init:      ", c)
c.rotate(); print("rotate:    ", c)
print("remove 3:  ", c.remove(3), c)
print("remove 2:  ", c.remove(2), c)
c.insert_back(5); print("insert 5:  ", c)
