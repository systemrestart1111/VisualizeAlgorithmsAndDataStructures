class ChainedHashTable:
    """每個桶是一條串列，碰撞的鍵就接在同一條上；負載因子（鍵數 / 桶數）超過 1 時桶數擴為 2m+1 並重新雜湊"""

    def __init__(self, m=5):
        self.buckets, self.count = [[] for _ in range(m)], 0

    def _rehash(self):
        old = [k for b in self.buckets for k in b]
        self.buckets, self.count = [[] for _ in range(2 * len(self.buckets) + 1)], 0
        print(f"  -> rehash to m = {len(self.buckets)}")
        for k in old:
            self.insert(k)

    def insert(self, k):
        b = self.buckets[k % len(self.buckets)]
        if k in b:
            return
        b.append(k)
        self.count += 1
        if self.count > len(self.buckets):
            self._rehash()

    def search(self, k):
        return k in self.buckets[k % len(self.buckets)]

    def delete(self, k):
        b = self.buckets[k % len(self.buckets)]
        if k in b:
            b.remove(k)
            self.count -= 1
            return True
        return False

    def show(self):
        for i, b in enumerate(self.buckets):
            print(f"  [{i:2d}]", " -> ".join(map(str, b)) if b else "-")


h = ChainedHashTable()
for k in [15, 11, 27, 8, 12, 20]:
    print(f"insert {k}")
    h.insert(k)
h.show()
print("search 27 ->", h.search(27), " search 9 ->", h.search(9))
print("delete 12 ->", h.delete(12))
h.show()
