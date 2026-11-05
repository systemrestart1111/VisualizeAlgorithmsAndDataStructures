from collections import deque


def window_max(a, k):
    """單調遞減雙端佇列（存索引）：隊首永遠是視窗內最大值的位置"""
    dq, res = deque(), []
    for i, x in enumerate(a):
        while dq and a[dq[-1]] <= x:  # 比 x 小的元素再也不會成為最大值
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:  # 隊首已離開視窗
            dq.popleft()
        if i >= k - 1:
            res.append(a[dq[0]])
    return res


print(*window_max([1, 3, -1, -3, 5, 3, 6, 7, 2, 4, 1], 3))
