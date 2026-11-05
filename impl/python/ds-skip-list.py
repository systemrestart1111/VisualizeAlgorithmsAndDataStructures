MAX_LEVEL = 4


class Rng:
    """Park–Miller 亂數，讓每種語言都得到相同的層數"""

    def __init__(self, seed):
        self.state = seed

    def rand_int(self, k):
        self.state = self.state * 48271 % 2147483647
        return self.state % k


class SNode:
    def __init__(self, val, level):
        self.val, self.next = val, [None] * level


class SkipList:
    """多層排序串列：每個節點以 1/2 機率往上多一層，搜尋時從最高層往下跳，期望 O(log n)"""

    def __init__(self):
        self.head, self.level, self.rng = SNode(None, MAX_LEVEL), 1, Rng(42)

    def _random_level(self):
        lvl = 1
        while lvl < MAX_LEVEL and self.rng.rand_int(2) == 0:
            lvl += 1
        return lvl

    def _find_update(self, k):
        """回傳每一層「最後一個 < k 的節點」"""
        update, x = [self.head] * MAX_LEVEL, self.head
        for i in range(self.level - 1, -1, -1):
            while x.next[i] and x.next[i].val < k:
                x = x.next[i]
            update[i] = x
        return update

    def insert(self, k):
        update = self._find_update(k)
        nxt = update[0].next[0]
        if nxt and nxt.val == k:
            return 0
        lvl = self._random_level()
        self.level = max(self.level, lvl)
        n = SNode(k, lvl)
        for i in range(lvl):
            n.next[i], update[i].next[i] = update[i].next[i], n
        return lvl

    def search(self, k):
        visited, x = [], self.head
        for i in range(self.level - 1, -1, -1):
            while x.next[i] and x.next[i].val < k:
                x = x.next[i]
                visited.append(x.val)
        x = x.next[0]
        return x is not None and x.val == k, visited

    def delete(self, k):
        update = self._find_update(k)
        x = update[0].next[0]
        if not x or x.val != k:
            return False
        for i in range(len(x.next)):
            update[i].next[i] = x.next[i]
        while self.level > 1 and self.head.next[self.level - 1] is None:
            self.level -= 1
        return True

    def show(self):
        for i in range(self.level - 1, -1, -1):
            vals, x = [], self.head.next[i]
            while x:
                vals.append(str(x.val))
                x = x.next[i]
            print(f"  L{i}:", " ".join(vals))


s = SkipList()
for k in [30, 10, 50, 20, 70, 40, 60, 80, 25]:
    print(f"insert {k} (level {s.insert(k)})")
s.show()
for k in [60, 45]:
    found, visited = s.search(k)
    print(f"search {k}: {'found' if found else 'not found'}, visited", " ".join(map(str, visited)))
print("delete 40 ->", "True" if s.delete(40) else "False")
s.show()
