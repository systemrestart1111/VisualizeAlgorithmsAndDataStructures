class Stack:
    """後進先出（LIFO）：只在頂端 push / pop，都是 O(1)"""

    def __init__(self):
        self.items = []

    def push(self, v):
        self.items.append(v)

    def pop(self):
        return self.items.pop()

    def peek(self):
        return self.items[-1]

    def __str__(self):
        return "bottom [" + " ".join(map(str, self.items)) + "] top"


s = Stack()
for v in [4, 8, 15]:
    s.push(v)
    print(f"push {v:2d}: {s}")
print("peek ->", s.peek())
for _ in range(2):
    print(f"pop -> {s.pop()}: {s}")
s.push(16); print("push 16:", s)
