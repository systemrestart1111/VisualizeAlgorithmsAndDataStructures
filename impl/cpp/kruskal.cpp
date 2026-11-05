#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>
using namespace std;

struct Edge { char a, b; int w; };
vector<int> parent(26);

int find(int x) {
    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
}

int main() {
    vector<Edge> edges = {{'A', 'B', 7}, {'A', 'D', 5}, {'B', 'C', 8}, {'B', 'D', 9}, {'B', 'E', 7}, {'C', 'E', 5},
                          {'D', 'E', 15}, {'D', 'F', 6}, {'E', 'F', 8}, {'E', 'G', 9}, {'F', 'G', 11}};
    iota(parent.begin(), parent.end(), 0);
    stable_sort(edges.begin(), edges.end(), [](const Edge& x, const Edge& y) { return x.w < y.w; });  // 同權重保持輸入順序
    // 邊依權重由小到大檢查；兩端不在同一棵樹（並查集）才加入，避免形成環
    int total = 0;
    for (auto& e : edges) {
        int ra = find(e.a - 'A'), rb = find(e.b - 'A');
        if (ra == rb) continue;
        parent[ra] = rb;
        total += e.w;
        cout << "take " << e.a << "-" << e.b << " (" << e.w << ")\n";
    }
    cout << "total weight = " << total << "\n";
}
