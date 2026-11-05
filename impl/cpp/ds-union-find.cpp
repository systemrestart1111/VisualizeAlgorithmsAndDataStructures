#include <cstdio>
#include <numeric>
#include <string>
#include <vector>
using namespace std;

// 並查集：路徑壓縮 + 依秩合併，單次操作均攤接近 O(1)（反阿克曼函數）
class DSU {
public:
    vector<int> p, rank;

    explicit DSU(int n) : p(n), rank(n, 0) { iota(p.begin(), p.end(), 0); }
    int find(int x) {
        int root = x;
        while (p[root] != root) root = p[root];
        while (p[x] != root) { int nx = p[x]; p[x] = root; x = nx; }  // 路徑壓縮：沿路的節點都直接接到根
        return root;
    }
    bool unite(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        if (rank[ra] < rank[rb]) swap(ra, rb);
        p[rb] = ra;  // rank 較小的根接到較大的底下
        if (rank[ra] == rank[rb]) rank[ra]++;
        return true;
    }
    string parents() const {
        string s = "parent =";
        for (int v : p) s += " " + to_string(v);
        return s;
    }
};

const char* b(bool x) { return x ? "True" : "False"; }

int main() {
    DSU d(10);
    int pairs[][2] = {{1, 2}, {3, 4}, {2, 4}, {5, 6}, {7, 8}, {8, 9}};
    for (auto& pr : pairs) {
        d.unite(pr[0], pr[1]);
        printf("union(%d, %d): %s\n", pr[0], pr[1], d.parents().c_str());
    }
    int r = d.find(4);
    printf("find(4) = %d  %s\n", r, d.parents().c_str());
    printf("same(1, 3) -> %s  same(1, 5) -> %s\n", b(d.find(1) == d.find(3)), b(d.find(1) == d.find(5)));
    printf("union(2, 3) -> %s (already together)\n", b(d.unite(2, 3)));
    printf("sets:");
    for (int root = 0; root < 10; root++) {
        if (d.find(root) != root) continue;
        string g;
        for (int i = 0; i < 10; i++) if (d.find(i) == root) g += (g.empty() ? "" : ",") + to_string(i);
        printf(" {%s}", g.c_str());
    }
    printf("\n");
}
