def merge(intervals, touch=True):
    """依左端點排序；touch=True 時相接的閉區間（如 [1,3] 與 [3,5]）也合併"""
    out = []
    for l, r in sorted(intervals):
        if out and (l <= out[-1][1] if touch else l < out[-1][1]):
            out[-1][1] = max(out[-1][1], r)
        else:
            out.append([l, r])
    return out


iv = [(1, 3), (8, 10), (2, 6), (10, 12), (15, 18), (17, 20)]
fmt = lambda xs: " ".join(f"[{l},{r}]" for l, r in xs)
print("merge touching:", fmt(merge(iv)))
print("keep touching :", fmt(merge(iv, touch=False)))
print("single        :", fmt(merge([(5, 5)])))
