class DynamicArray:
    """容量滿時加倍、只剩 1/4 時減半；搬移成本攤銷後，每次 append / pop 平均 O(1)"""

    def __init__(self):
        self.cap, self.size, self.data = 1, 0, [None]

    def _resize(self, cap):
        new = [None] * cap
        for i in range(self.size):
            new[i] = self.data[i]
        self.data, self.cap = new, cap

    def append(self, v):
        if self.size == self.cap:
            self._resize(self.cap * 2)
        self.data[self.size] = v
        self.size += 1

    def pop(self):
        self.size -= 1
        v = self.data[self.size]
        self.data[self.size] = None
        if self.cap > 1 and self.size <= self.cap // 4:
            self._resize(self.cap // 2)
        return v

    def __str__(self):
        return "[" + " ".join(map(str, self.data[: self.size])) + f"] size={self.size} cap={self.cap}"


arr = DynamicArray()
for v in [10, 20, 30, 40, 50]:
    arr.append(v)
    print(f"append {v}: {arr}")
for _ in range(4):
    v = arr.pop()
    print(f"pop -> {v}: {arr}")
