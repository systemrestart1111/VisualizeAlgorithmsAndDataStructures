#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

const int N = 15;
vector<vector<int>> children(N);
int parent[N], depth[N], sz[N], heavy[N], head[N], pos[N];
vector<int> order;

// 計算子樹大小；子樹最大的孩子是重兒子（相同時取先出現的）
void dfsSize(int u) {
    sz[u] = 1;
    for (int v : children[u]) {
        parent[v] = u;
        depth[v] = depth[u] + 1;
        dfsSize(v);
        sz[u] += sz[v];
        if (heavy[u] == 0 || sz[v] > sz[heavy[u]]) heavy[u] = v;
    }
}

// 沿重兒子延伸同一條重鏈（head 相同、pos 連續），輕兒子各自開新鏈
void decompose(int u, int h) {
    head[u] = h;
    pos[u] = (int)order.size();
    order.push_back(u);
    if (heavy[u]) decompose(heavy[u], h);
    for (int v : children[u])
        if (v != heavy[u]) decompose(v, v);
}

void printRange(int lo, int hi) {
    cout << " ";
    for (int i = lo; i <= hi; i++) cout << " " << order[i];
    cout << "\n";
}

// 路徑 a–b 拆成 O(log n) 段，每段都是重鏈上 pos 連續的一段
void pathSegments(int a, int b) {
    while (head[a] != head[b]) {
        if (depth[head[a]] < depth[head[b]]) swap(a, b);
        printRange(pos[head[a]], pos[a]);
        a = parent[head[a]];
    }
    printRange(min(pos[a], pos[b]), max(pos[a], pos[b]));
}

int main() {
    vector<pair<int, int>> edges = {{1, 2}, {1, 3}, {1, 4}, {2, 5}, {2, 6}, {3, 7}, {5, 8}, {5, 9}, {5, 10}, {7, 11}, {9, 12}, {4, 13}, {13, 14}};
    for (auto& e : edges) children[e.first].push_back(e.second);
    dfsSize(1);
    decompose(1, 1);
    cout << "chains:\n";
    for (int u : order) {
        if (head[u] != u) continue;
        cout << " ";
        for (int v = u; v; v = heavy[v]) cout << " " << v;
        cout << "\n";
    }
    cout << "path(12, 14) segments:\n";
    pathSegments(12, 14);
}
