#include <cstdio>
#include <queue>
#include <utility>
#include <vector>
using namespace std;

const char* NAMES = "ABCDE";

// 無向加權圖，同時維護兩種表示法：鄰接矩陣 O(V²) 空間、鄰接串列 O(V + E) 空間
class Graph {
public:
    vector<vector<int>> matrix;
    vector<vector<pair<int, int>>> adj;  // 每項為 (鄰居, 權重)

    explicit Graph(int n) : matrix(n, vector<int>(n, 0)), adj(n) {}
    void addEdge(int u, int v, int w) {
        matrix[u][v] = matrix[v][u] = w;
        adj[u].push_back({v, w});
        adj[v].push_back({u, w});
    }
    void removeEdge(int u, int v) {
        matrix[u][v] = matrix[v][u] = 0;
        auto drop = [](vector<pair<int, int>>& lst, int x) {
            vector<pair<int, int>> keep;
            for (auto& e : lst) if (e.first != x) keep.push_back(e);
            lst = keep;
        };
        drop(adj[u], v);
        drop(adj[v], u);
    }
    vector<int> bfs(int s) const {
        vector<bool> seen(adj.size(), false);
        vector<int> order;
        queue<int> q;
        q.push(s); seen[s] = true;
        while (!q.empty()) {
            int u = q.front(); q.pop();
            order.push_back(u);
            for (auto& e : adj[u]) if (!seen[e.first]) { seen[e.first] = true; q.push(e.first); }
        }
        return order;
    }
    void dfs(int u, vector<bool>& seen, vector<int>& order) const {
        seen[u] = true;
        order.push_back(u);
        for (auto& e : adj[u]) if (!seen[e.first]) dfs(e.first, seen, order);
    }
    void show() const {
        printf("matrix:  ");
        for (size_t i = 0; i < matrix.size(); i++) printf("  %c", NAMES[i]);
        printf("\n");
        for (size_t i = 0; i < matrix.size(); i++) {
            printf("        %c", NAMES[i]);
            for (int w : matrix[i]) printf(" %2d", w);
            printf("\n");
        }
        printf("list:\n");
        for (size_t i = 0; i < adj.size(); i++) {
            printf("  %c ->", NAMES[i]);
            if (adj[i].empty()) printf(" -");
            for (auto& e : adj[i]) printf(" %c(%d)", NAMES[e.first], e.second);
            printf("\n");
        }
    }
};

void printOrder(const char* label, const vector<int>& order) {
    printf("%s", label);
    for (int u : order) printf(" %c", NAMES[u]);
    printf("\n");
}

int main() {
    Graph g(5);
    g.addEdge(0, 1, 4); g.addEdge(0, 2, 2); g.addEdge(1, 3, 5); g.addEdge(2, 3, 8); g.addEdge(3, 4, 3);
    g.show();
    g.addEdge(0, 4, 6); printf("add edge A-E (6)\n");
    g.removeEdge(2, 3); printf("remove edge C-D\n");
    g.show();
    printOrder("BFS from A:", g.bfs(0));
    vector<bool> seen(5, false);
    vector<int> order;
    g.dfs(0, seen, order);
    printOrder("DFS from A:", order);
}
