EMPTY, DELETED = None, "DEL"


class OpenAddressingTable:
    """所有鍵都放在同一個陣列；碰撞時線性探測下一格。刪除要留「墓碑」，否則會截斷後面鍵的探測路徑"""

    def __init__(self, m=11):
        self.slots = [EMPTY] * m

    def _probe(self, k):
        m = len(self.slots)
        for i in range(m):
            yield (k + i) % m

    def insert(self, k):
        first_tomb = None
        for idx in self._probe(k):
            s = self.slots[idx]
            if s == k:
                return idx  # 已存在
            if s == DELETED and first_tomb is None:
                first_tomb = idx  # 先記下來，繼續往後確認 k 不存在
            if s is EMPTY:
                target = first_tomb if first_tomb is not None else idx
                self.slots[target] = k
                return target
        if first_tomb is not None:
            self.slots[first_tomb] = k
            return first_tomb
        raise OverflowError("table is full")

    def search(self, k):
        probes = 0
        for idx in self._probe(k):
            probes += 1
            if self.slots[idx] is EMPTY:
                return -1, probes
            if self.slots[idx] == k:
                return idx, probes
        return -1, probes

    def delete(self, k):
        idx, _ = self.search(k)
        if idx >= 0:
            self.slots[idx] = DELETED
        return idx >= 0

    def __str__(self):
        return " ".join("." if s is EMPTY else "X" if s == DELETED else str(s) for s in self.slots)


t = OpenAddressingTable()
for k in [22, 1, 13, 11, 24, 33, 18]:
    print(f"insert {k:2d} -> slot {t.insert(k):2d}   [{t}]")
print("search 33 -> (slot, probes) =", t.search(33))
print("delete 13 ->", t.delete(13), f"  [{t}]")
print("search 24 -> (slot, probes) =", t.search(24), "(passes the tombstone)")
print(f"insert 35 -> slot {t.insert(35):2d}   [{t}] (reuses the tombstone)")
