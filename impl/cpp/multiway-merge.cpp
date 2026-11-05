#include <functional>
#include <iostream>
#include <queue>
#include <tuple>
#include <vector>
using namespace std;

// 最小堆積放 (值, 串列編號, 位置)，每次取最小者並補上同串列的下一個
vector<int> kwayMerge(const vector<vector<int>> &lists) {
    priority_queue<tuple<int, int, int>, vector<tuple<int, int, int>>, greater<tuple<int, int, int>>> pq;
    for (size_t i = 0; i < lists.size(); i++) if (!lists[i].empty()) pq.push(make_tuple(lists[i][0], (int)i, 0));
    vector<int> out;
    while (!pq.empty()) {
        int x, i, p;
        tie(x, i, p) = pq.top();
        pq.pop();
        out.push_back(x);
        if (p + 1 < (int)lists[i].size()) pq.push(make_tuple(lists[i][p + 1], i, p + 1));
    }
    return out;
}
void show(const vector<int> &v, const char *tail = "") {
    for (size_t i = 0; i < v.size(); i++) cout << (i ? " " : "") << v[i];
    cout << tail << "\n";
}

int main() {
    show(kwayMerge({{1, 4, 9, 12}, {2, 3, 10}, {}, {5}, {6, 7, 8, 11, 13}}));
    show(kwayMerge({{}, {}}), " (empty)");
    show(kwayMerge({{1, 1, 2}, {1, 3}}));
}
