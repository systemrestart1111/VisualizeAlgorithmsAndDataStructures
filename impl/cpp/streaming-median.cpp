#include <cstdio>
#include <functional>
#include <queue>
#include <vector>
using namespace std;

// 左半最大堆積、右半最小堆積；保持 |左| = |右| 或 |右| + 1
struct StreamingMedian {
    priority_queue<int> lo;
    priority_queue<int, vector<int>, greater<int>> hi;
    void add(int x) {
        if (lo.empty() || x <= lo.top()) lo.push(x); else hi.push(x);
        if (lo.size() > hi.size() + 1) { hi.push(lo.top()); lo.pop(); }
        else if (hi.size() > lo.size()) { lo.push(hi.top()); hi.pop(); }
    }
    double median() const { return lo.size() > hi.size() ? lo.top() : (lo.top() + hi.top()) / 2.0; }
};

int main() {
    StreamingMedian sm;
    bool first = true;
    for (int x : {5, 15, 1, 3, 8, 7, 9, 10, 20, -4, 7, 7}) { sm.add(x); printf(first ? "%d->%.1f" : " %d->%.1f", x, sm.median()); first = false; }
    printf("\n");
}
