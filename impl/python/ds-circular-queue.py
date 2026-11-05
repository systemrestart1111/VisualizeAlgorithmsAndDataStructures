class CircularQueue:
    """固定大小的環狀緩衝區：head、tail 走到陣列尾端就繞回 0，空間可重複使用"""

    def __init__(self, cap):
        self.buf, self.head, self.size = [None] * cap, 0, 0

    def enqueue(self, v):
        if self.size == len(self.buf):
            return False  # 已滿
        self.buf[(self.head + self.size) % len(self.buf)] = v
        self.size += 1
        return True

    def dequeue(self):
        v = self.buf[self.head]
        self.buf[self.head] = None
        self.head = (self.head + 1) % len(self.buf)
        self.size -= 1
        return v

    def __str__(self):
        cells = " ".join("." if x is None else str(x) for x in self.buf)
        return f"buffer [{cells}] head={self.head} size={self.size}"


q = CircularQueue(5)
for v in [1, 2, 3, 4]:
    q.enqueue(v)
print("enqueue 1..4: ", q)
a, b = q.dequeue(), q.dequeue()
print(f"dequeue -> {a} {b}  {q}")
for v in [5, 6, 7]:
    print(f"enqueue {v}: {'ok  ' if q.enqueue(v) else 'full'}", q)
a = q.dequeue()
print(f"dequeue -> {a}  {q}")
