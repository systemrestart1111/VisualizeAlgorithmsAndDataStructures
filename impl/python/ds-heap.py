class MinHeap:
    """以陣列存放的完全二元樹：i 的子節點在 2i+1、2i+2，父節點在 (i-1)//2；堆頂永遠是最小值"""

    def __init__(self, items=()):
        self.a = list(items)
        for i in range(len(self.a) // 2 - 1, -1, -1):  # 自底向上建堆，O(n)
            self._sift_down(i)

    def push(self, v):
        a = self.a
        a.append(v)
        i = len(a) - 1
        while i > 0 and a[(i - 1) // 2] > a[i]:  # 上浮
            p = (i - 1) // 2
            a[i], a[p] = a[p], a[i]
            i = p

    def pop(self):
        a = self.a
        top, last = a[0], a.pop()
        if a:
            a[0] = last
            self._sift_down(0)
        return top

    def _sift_down(self, i):
        a, n = self.a, len(self.a)
        while True:
            s, l, r = i, 2 * i + 1, 2 * i + 2
            if l < n and a[l] < a[s]:
                s = l
            if r < n and a[r] < a[s]:
                s = r
            if s == i:
                return
            a[i], a[s] = a[s], a[i]
            i = s

    def __str__(self):
        return "[" + " ".join(map(str, self.a)) + "]"


h = MinHeap()
for v in [35, 12, 48, 7, 20, 3, 41]:
    h.push(v)
    print(f"push {v:2d}: {h}")
print("peek ->", h.a[0])
for _ in range(3):
    top = h.pop()
    print(f"pop -> {top:2d}: {h}")
b = MinHeap([9, 4, 7, 1, 8, 2, 6])
print("build [9 4 7 1 8 2 6] ->", b)
print("heap sort:", " ".join(str(b.pop()) for _ in range(7)))
