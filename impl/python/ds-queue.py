class Node:
    def __init__(self, val):
        self.val, self.next = val, None


class Queue:
    """先進先出（FIFO）：用鏈結串列，從尾端 enqueue、從頭端 dequeue，都是 O(1)"""

    def __init__(self):
        self.head = self.tail = None

    def enqueue(self, v):
        n = Node(v)
        if self.tail:
            self.tail.next = n
        else:
            self.head = n
        self.tail = n

    def dequeue(self):
        n = self.head
        self.head = n.next
        if not self.head:
            self.tail = None
        return n.val

    def __str__(self):
        out, cur = [], self.head
        while cur:
            out.append(str(cur.val))
            cur = cur.next
        return "front [" + " ".join(out) + "] rear"


q = Queue()
for v in ["A", "B", "C"]:
    q.enqueue(v)
    print(f"enqueue {v}: {q}")
print(f"dequeue -> {q.dequeue()}: {q}")
q.enqueue("D"); print("enqueue D:", q)
print(f"dequeue -> {q.dequeue()}: {q}")
