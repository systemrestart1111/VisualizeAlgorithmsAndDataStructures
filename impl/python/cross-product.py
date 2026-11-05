def cross(o, a, b):
    """(A - O) × (B - O)：> 0 表示 B 在 OA 左側（逆時針），< 0 在右側，= 0 共線"""
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


O, A = (2, 2), (8, 4)
for B in [(4, 8), (9, 1), (5, 3), (11, 5)]:
    c = cross(O, A, B)
    side = "left (counter-clockwise)" if c > 0 else "right (clockwise)" if c < 0 else "collinear"
    print(f"B={B[0]},{B[1]}: cross = {c:4d} -> {side}")
