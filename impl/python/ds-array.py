class FixedArray:
    """固定容量的陣列：隨機存取 O(1)；在中間插入或刪除需要搬移後面的元素 O(n)"""

    def __init__(self, capacity):
        self.data, self.size = [None] * capacity, 0

    def insert(self, i, v):
        if self.size == len(self.data):
            raise OverflowError("array is full")
        for k in range(self.size, i, -1):  # i 之後的元素整段右移
            self.data[k] = self.data[k - 1]
        self.data[i] = v
        self.size += 1

    def delete(self, i):
        v = self.data[i]
        for k in range(i, self.size - 1):  # i 之後的元素整段左移
            self.data[k] = self.data[k + 1]
        self.size -= 1
        self.data[self.size] = None
        return v

    def search(self, v):
        return next((i for i in range(self.size) if self.data[i] == v), -1)

    def __str__(self):
        return "[" + " ".join(str(self.data[i]) for i in range(self.size)) + "]" + f" size={self.size}/{len(self.data)}"


a = FixedArray(8)
for i, v in enumerate([5, 3, 8, 1]):
    a.insert(i, v)
print("init:      ", a)
a.insert(2, 42); print("insert(2,42):", a)
a.data[0] = 7; print("set a[0]=7:  ", a)
print("delete(1) ->", a.delete(1), a)
print("search(8) ->", a.search(8))
