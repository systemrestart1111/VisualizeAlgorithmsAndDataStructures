class Deque:
    """雙端佇列：用環狀陣列實作，兩端都能 O(1) 加入與移除；滿了就把容量加倍"""

    def __init__(self, cap=4):
        self.buf, self.head, self.size = [None] * cap, 0, 0

    def _grow(self):
        old = [self.buf[(self.head + i) % len(self.buf)] for i in range(self.size)]
        self.buf = old + [None] * len(old)
        self.head = 0

    def push_front(self, v):
        if self.size == len(self.buf):
            self._grow()
        self.head = (self.head - 1) % len(self.buf)
        self.buf[self.head] = v
        self.size += 1

    def push_back(self, v):
        if self.size == len(self.buf):
            self._grow()
        self.buf[(self.head + self.size) % len(self.buf)] = v
        self.size += 1

    def pop_front(self):
        v = self.buf[self.head]
        self.head = (self.head + 1) % len(self.buf)
        self.size -= 1
        return v

    def pop_back(self):
        self.size -= 1
        return self.buf[(self.head + self.size) % len(self.buf)]

    def __str__(self):
        items = [str(self.buf[(self.head + i) % len(self.buf)]) for i in range(self.size)]
        return f"[{' '.join(items)}] cap={len(self.buf)}"


d = Deque()
d.push_back(1); d.push_back(2); d.push_front(0)
print("push_back 1, push_back 2, push_front 0:", d)
d.push_front(-1); d.push_back(3); print("push_front -1, push_back 3:", d)
a, b = d.pop_front(), d.pop_back()
print(f"pop_front -> {a}  pop_back -> {b}  {d}")
