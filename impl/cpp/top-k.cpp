#include <algorithm>
#include <functional>
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

// 維持大小為 k 的最小堆積：比堆頂大的元素才換進來，最後堆內就是最大的 k 個
vector<int> topK(const vector<int>& a, int k) {
    priority_queue<int, vector<int>, greater<int>> heap;
    for (int x : a) {
        if ((int)heap.size() < k) heap.push(x);
        else if (x > heap.top()) { heap.pop(); heap.push(x); }
    }
    vector<int> out;
    while (!heap.empty()) { out.push_back(heap.top()); heap.pop(); }
    reverse(out.begin(), out.end());
    return out;
}

int main() {
    vector<int> a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47};
    cout << "top 4:";
    for (int x : topK(a, 4)) cout << " " << x;
    cout << "\n";
}
