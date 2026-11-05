def linear_search(a, t):
    """從頭到尾逐一比較，找到回傳索引，找不到回傳 -1"""
    for i, x in enumerate(a):
        if x == t:
            return i
    return -1


a = [29, 4, 71, 15, 42, 8, 63, 37, 90, 22]
print("search 63 ->", linear_search(a, 63))
print("search 100 ->", linear_search(a, 100))
