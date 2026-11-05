#include <cstdio>
#include <queue>
#include <vector>
using namespace std;

vector<pair<double, double>> P = {{2.1, 3.0}, {2.8, 2.4}, {3.4, 3.6}, {2.5, 4.1}, {3.9, 2.7}, {1.8, 2.2}, {3.0, 3.1}, {2.2, 3.8},
                                  {7.0, 7.4}, {7.8, 6.6}, {8.3, 7.9}, {6.9, 6.4}, {7.5, 8.2}, {8.6, 6.9}, {7.2, 7.0},
                                  {6.6, 2.1}, {7.4, 2.9}, {7.9, 2.2}, {6.9, 3.2},
                                  {5.0, 5.2}, {0.5, 9.0}, {9.5, 0.6}, {4.6, 8.8}};

// N(p) 含 p 自己；|N(p)| ≥ minPts 為核心點；從核心點 BFS 擴張，其餘為雜訊
void dbscan(double eps, int minPts) {
    int n = P.size(), c = -1;
    vector<vector<int>> nb(n);
    vector<bool> core(n);
    vector<int> lab(n, -1);
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) { double dx = P[i].first - P[j].first, dy = P[i].second - P[j].second; if (dx * dx + dy * dy <= eps * eps) nb[i].push_back(j); }
        core[i] = (int)nb[i].size() >= minPts;
    }
    for (int i = 0; i < n; i++) {
        if (lab[i] >= 0 || !core[i]) continue;
        lab[i] = ++c;
        queue<int> q;
        q.push(i);
        while (!q.empty()) {
            int cur = q.front();
            q.pop();
            for (int j : nb[cur]) if (lab[j] < 0) { lab[j] = c; if (core[j]) q.push(j); }
        }
    }
    int nc = 0, border = 0, noise = 0;
    for (int i = 0; i < n; i++) { nc += core[i]; border += lab[i] >= 0 && !core[i]; noise += lab[i] < 0; }
    printf("eps %.1f, minPts %d: %d clusters, core %d, border %d, noise %d; labels", eps, minPts, c + 1, nc, border, noise);
    for (int v : lab) printf(" %d", v);
    printf("\n");
}

int main() {
    dbscan(1.2, 4);
    dbscan(0.8, 4);
    dbscan(2.0, 4);
    dbscan(1.2, 3);
    dbscan(1.2, 6);
}
