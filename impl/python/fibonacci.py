from functools import lru_cache

calls = 0


def fib_naive(n):
    """單純遞迴：同一個子問題被重複計算，呼叫次數呈指數成長"""
    global calls
    calls += 1
    return n if n < 2 else fib_naive(n - 1) + fib_naive(n - 2)


@lru_cache(maxsize=None)
def fib_memo(n):
    """記憶化遞迴：每個子問題只算一次"""
    return n if n < 2 else fib_memo(n - 1) + fib_memo(n - 2)


def fib_tab(n):
    """表格法：由小到大填表"""
    t = [0, 1] + [0] * max(0, n - 1)
    for i in range(2, n + 1):
        t[i] = t[i - 1] + t[i - 2]
    return t[: n + 1]


n = 6
print(f"naive fib({n}) = {fib_naive(n)}, calls = {calls}")
print(f"memo  fib({n}) = {fib_memo(n)}")
print("table:", *fib_tab(n))
