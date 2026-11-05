#include <deque>
#include <iostream>
#include <vector>
using namespace std;

// 單調遞減雙端佇列（存索引）：隊首永遠是視窗內最大值的位置
vector<int> windowMax(const vector<int>& a, int k) {
    deque<int> dq;
    vector<int> res;
    for (int i = 0; i < (int)a.size(); i++) {
        while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();  // 比 a[i] 小的元素再也不會成為最大值
        dq.push_back(i);
        if (dq.front() <= i - k) dq.pop_front();                    // 隊首已離開視窗
        if (i >= k - 1) res.push_back(a[dq.front()]);
    }
    return res;
}

int main() {
    vector<int> r = windowMax({1, 3, -1, -3, 5, 3, 6, 7, 2, 4, 1}, 3);
    for (size_t i = 0; i < r.size(); i++) cout << r[i] << (i + 1 < r.size() ? ' ' : '\n');
}
