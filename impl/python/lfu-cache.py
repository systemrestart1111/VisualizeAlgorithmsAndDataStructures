from collections import OrderedDict, defaultdict


class LFUCache:
    """依使用次數分桶，每桶是一條 LRU（OrderedDict：前面最久未用）；追蹤 minFreq"""

    def __init__(self, cap):
        self.cap, self.val, self.freq = cap, {}, {}
        self.buckets = defaultdict(OrderedDict)
        self.min_freq = 0

    def _touch(self, k):
        f = self.freq[k]
        del self.buckets[f][k]
        if not self.buckets[f] and self.min_freq == f:
            self.min_freq += 1
        self.freq[k] = f + 1
        self.buckets[f + 1][k] = None

    def get(self, k):
        if k not in self.val:
            return -1
        self._touch(k)
        return self.val[k]

    def put(self, k, v):
        if self.cap <= 0:
            return
        if k in self.val:
            self.val[k] = v
            self._touch(k)
            return
        if len(self.val) >= self.cap:
            old, _ = self.buckets[self.min_freq].popitem(last=False)
            del self.val[old], self.freq[old]
        self.val[k], self.freq[k] = v, 1
        self.buckets[1][k] = None
        self.min_freq = 1


c = LFUCache(2)
c.put(1, 1)
c.put(2, 2)
print("get 1 ->", c.get(1))
c.put(3, 3)
a = c.get(2)
b = c.get(3)
print("get 2 ->", a, "| get 3 ->", b)
c.put(4, 4)
a, b, d = c.get(1), c.get(3), c.get(4)
print("get 1 ->", a, "| get 3 ->", b, "| get 4 ->", d)
print("freq:", " ".join(f"{k}:{c.freq[k]}" for k in sorted(c.freq)))
