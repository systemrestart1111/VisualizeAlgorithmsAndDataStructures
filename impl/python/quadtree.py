CAP, MAXD = 1, 5


class QT:
    def __init__(self, x0, y0, s, depth):
        self.x0, self.y0, self.s, self.depth = x0, y0, s, depth
        self.pts, self.kids = [], None

    def insert(self, p):
        """葉格滿了且未達最大深度就分成四格，原本的點往下移"""
        if self.kids is None:
            if len(self.pts) < CAP or self.depth >= MAXD:
                self.pts.append(p)
                return
            h = self.s // 2
            self.kids = [QT(self.x0 + dx, self.y0 + dy, h, self.depth + 1) for dx, dy in ((0, 0), (h, 0), (0, h), (h, h))]
            old, self.pts = self.pts, []
            for q in old:
                self.insert(q)
        h = self.s // 2
        k = (1 if p[0] >= self.x0 + h else 0) + (2 if p[1] >= self.y0 + h else 0)
        self.kids[k].insert(p)

    def range(self, x1, y1, x2, y2, out):
        """只走進與查詢矩形相交的格子；回傳拜訪的格子數"""
        if self.x0 > x2 or self.x0 + self.s <= x1 or self.y0 > y2 or self.y0 + self.s <= y1:
            return 0
        out += [p for p in self.pts if x1 <= p[0] <= x2 and y1 <= p[1] <= y2]
        return 1 + sum(c.range(x1, y1, x2, y2, out) for c in (self.kids or []))

    def count(self):
        return 1 + sum(c.count() for c in (self.kids or []))


root = QT(0, 0, 64, 0)
for p in [(10, 10), (50, 12), (20, 40), (30, 35), (55, 55), (8, 52), (40, 20), (45, 22), (45, 22), (45, 22)]:
    root.insert(p)
print("cells:", root.count())
for rect in [(10, 10, 40, 40), (40, 10, 63, 30), (0, 0, 63, 63), (60, 0, 63, 5)]:
    out = []
    v = root.range(*rect, out)
    print(f"range {rect}: {len(out)} points {sorted(out)} visited {v}")
