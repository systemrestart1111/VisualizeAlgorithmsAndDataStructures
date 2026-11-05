class SegmentTree:
    """區間加值 + 區間求和；lazy[o] 記錄「整段都要加、但還沒往下推」的值，兩種操作都是 O(log n)"""

    def __init__(self, a):
        self.n = len(a)
        self.sum = [0] * (4 * self.n)
        self.lazy = [0] * (4 * self.n)
        self._build(1, 0, self.n - 1, a)

    def _build(self, o, l, r, a):
        if l == r:
            self.sum[o] = a[l]
            return
        m = (l + r) // 2
        self._build(2 * o, l, m, a)
        self._build(2 * o + 1, m + 1, r, a)
        self.sum[o] = self.sum[2 * o] + self.sum[2 * o + 1]

    def _apply(self, o, l, r, v):
        self.sum[o] += v * (r - l + 1)
        self.lazy[o] += v

    def _push(self, o, l, r):
        if self.lazy[o]:  # 要往下走之前，才把延遲的加值交給兩個子節點
            m = (l + r) // 2
            self._apply(2 * o, l, m, self.lazy[o])
            self._apply(2 * o + 1, m + 1, r, self.lazy[o])
            self.lazy[o] = 0

    def add(self, ql, qr, v, o=1, l=0, r=None):
        if r is None:
            r = self.n - 1
        if qr < l or r < ql:
            return
        if ql <= l and r <= qr:  # 整段被覆蓋：只更新這個節點並記下 lazy
            self._apply(o, l, r, v)
            return
        self._push(o, l, r)
        m = (l + r) // 2
        self.add(ql, qr, v, 2 * o, l, m)
        self.add(ql, qr, v, 2 * o + 1, m + 1, r)
        self.sum[o] = self.sum[2 * o] + self.sum[2 * o + 1]

    def query(self, ql, qr, o=1, l=0, r=None):
        if r is None:
            r = self.n - 1
        if qr < l or r < ql:
            return 0
        if ql <= l and r <= qr:
            return self.sum[o]
        self._push(o, l, r)
        m = (l + r) // 2
        return self.query(ql, qr, 2 * o, l, m) + self.query(ql, qr, 2 * o + 1, m + 1, r)


def show(st):
    print("array:", "[" + " ".join(str(st.query(i, i)) for i in range(st.n)) + "]")


st = SegmentTree([5, 8, 6, 3, 2, 7, 2, 6])
show(st)
print("sum[2, 5] =", st.query(2, 5))
st.add(1, 4, 3); print("add +3 on [1, 4]")
print("sum[0, 7] =", st.query(0, 7))
print("sum[3, 6] =", st.query(3, 6))
st.add(4, 7, -2); print("add -2 on [4, 7]")
show(st)
print("sum[0, 7] =", st.query(0, 7))
