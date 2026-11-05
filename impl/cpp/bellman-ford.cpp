#include <climits>
#include <iostream>
#include <vector>
using namespace std;

struct Edge { int a, b, w; };

// 對所有邊做 V-1 輪鬆弛；第 V 輪若還能變短，代表有負環
int main() {
    vector<Edge> edges = {{0, 1, 6}, {0, 2, 7}, {1, 3, 5}, {1, 2, 8}, {1, 4, -4}, {2, 3, -3}, {2, 4, 9}, {3, 1, -2}, {4, 3, 7}, {4, 0, 2}};  // 有向圖，可含負權
    int n = 5;
    vector<long long> dist(n, LLONG_MAX);
    dist[0] = 0;
    for (int it = 0; it < n - 1; it++) {
        bool changed = false;
        for (auto& e : edges)
            if (dist[e.a] != LLONG_MAX && dist[e.a] + e.w < dist[e.b]) { dist[e.b] = dist[e.a] + e.w; changed = true; }
        if (!changed) break;
    }
    bool neg = false;
    for (auto& e : edges)
        if (dist[e.a] != LLONG_MAX && dist[e.a] + e.w < dist[e.b]) neg = true;
    cout << "dist:";
    for (int v = 0; v < n; v++) cout << " " << char('A' + v) << "=" << dist[v];
    cout << "\nnegative cycle: " << (neg ? "True" : "False") << "\n";
}
