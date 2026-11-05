import heapq


class StreamingMedian:
    """左半用最大堆積（存負值）、右半用最小堆積；保持 |左| = |右| 或 |右| + 1"""

    def __init__(self):
        self.lo, self.hi = [], []

    def add(self, x):
        if not self.lo or x <= -self.lo[0]:
            heapq.heappush(self.lo, -x)
        else:
            heapq.heappush(self.hi, x)
        if len(self.lo) > len(self.hi) + 1:
            heapq.heappush(self.hi, -heapq.heappop(self.lo))
        elif len(self.hi) > len(self.lo):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))

    def median(self):
        if len(self.lo) > len(self.hi):
            return float(-self.lo[0])
        return (-self.lo[0] + self.hi[0]) / 2


sm = StreamingMedian()
out = []
for x in [5, 15, 1, 3, 8, 7, 9, 10, 20, -4, 7, 7]:
    sm.add(x)
    out.append(f"{x}->{sm.median():.1f}")
print(" ".join(out))
