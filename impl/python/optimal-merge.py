import heapq

# 每次合併最短的兩個檔案（與霍夫曼編碼同樣的貪婪策略），總搬移成本最小
files = [20, 30, 10, 5, 30, 15]
heapq.heapify(files)
total = 0
while len(files) > 1:
    a, b = heapq.heappop(files), heapq.heappop(files)
    total += a + b
    heapq.heappush(files, a + b)
    print(f"merge {a} + {b} = {a + b}")
print("total cost =", total)
