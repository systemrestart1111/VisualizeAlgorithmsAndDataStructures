#include <algorithm>
#include <cmath>
#include <cstdio>
#include <queue>
#include <tuple>
#include <vector>
using namespace std;
const int N = 16;
typedef vector<vector<double>> Terrain;

Terrain terrain(int t) {
    Terrain H(N, vector<double>(N));
    if (t == 1) {
        for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) H[r][c] = min((r - 4) * (r - 4) + (c - 4) * (c - 4), (r - 11) * (r - 11) + (c - 11) * (c - 11)) / 4;
        return H;
    }
    vector<vector<int>> B(N, vector<int>(N));
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) B[r][c] = (r - 5.5) * (r - 5.5) + (c - 5) * (c - 5) <= 16 || (r - 9) * (r - 9) + (c - 10.5) * (c - 10.5) <= 16 || (r - 13) * (r - 13) + (c - 2.5) * (c - 2.5) <= 3.5;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            if (!B[r][c]) { H[r][c] = 1; continue; }
            double best = 1e9;
            for (int y = 0; y < N; y++) for (int x = 0; x < N; x++) if (!B[y][x]) best = min(best, hypot(y - r, x - c));
            H[r][c] = -floor(best * 10 + 0.5) / 10;
        }
    return H;
}

// 區域極小值各給一個編號；優先佇列每次取最低者（同高度先進先出），把未標記的鄰居標成同一編號
int watershed(const Terrain &H, vector<vector<int>> &lab) {
    vector<pair<int, int>> D4 = {{-1, 0}, {0, -1}, {0, 1}, {1, 0}};
    lab.assign(N, vector<int>(N, 0));
    vector<vector<bool>> seen(N, vector<bool>(N, false));
    int n = 0;
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++) {
            if (seen[i][j]) continue;
            vector<pair<int, int>> comp = {{i, j}};
            seen[i][j] = true;
            bool isMin = true;
            for (size_t k = 0; k < comp.size(); k++)
                for (auto &d : D4) {
                    int y = comp[k].first + d.first, x = comp[k].second + d.second;
                    if (y < 0 || y >= N || x < 0 || x >= N) continue;
                    if (H[y][x] < H[i][j]) isMin = false;
                    else if (H[y][x] == H[i][j] && !seen[y][x]) { seen[y][x] = true; comp.push_back({y, x}); }
                }
            if (isMin) { n++; for (auto &p : comp) lab[p.first][p.second] = n; }
        }
    priority_queue<tuple<double, int, int, int>, vector<tuple<double, int, int, int>>, greater<tuple<double, int, int, int>>> pq;
    int seq = 0;
    for (int i = 0; i < N; i++) for (int j = 0; j < N; j++) if (lab[i][j]) pq.push(make_tuple(H[i][j], seq++, i, j));
    while (!pq.empty()) {
        int i = get<2>(pq.top()), j = get<3>(pq.top());
        pq.pop();
        for (auto &d : D4) {
            int y = i + d.first, x = j + d.second;
            if (y >= 0 && y < N && x >= 0 && x < N && !lab[y][x]) { lab[y][x] = lab[i][j]; pq.push(make_tuple(H[y][x], seq++, y, x)); }
        }
    }
    return n;
}

int main() {
    const char *names[2] = {"blob distance", "two basins"};
    for (int t = 0; t < 2; t++) {
        vector<vector<int>> lab;
        int n = watershed(terrain(t), lab), boundary = 0;
        vector<int> sizes(n, 0);
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                sizes[lab[r][c] - 1]++;
                if ((c + 1 < N && lab[r][c + 1] != lab[r][c]) || (r + 1 < N && lab[r + 1][c] != lab[r][c])) boundary++;
            }
        sort(sizes.rbegin(), sizes.rend());
        printf("%s: %d regions, sizes [", names[t], n);
        for (int k = 0; k < n; k++) printf(k ? ", %d" : "%d", sizes[k]);
        printf("], watershed boundary pixels %d\n", boundary);
    }
}
