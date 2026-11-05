#include <algorithm>
#include <cstdio>
#include <functional>
#include <map>
#include <queue>
#include <string>
#include <vector>
using namespace std;
const int N = 16;
typedef vector<vector<int>> Img;
typedef vector<pair<int, int>> Nb;

Img make(int t) {
    Img a(N, vector<int>(N));
    long long s = 5;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++)
            a[r][c] = t == 2 ? (((r + c) % 4 == 0 && r % 2 == 0) || (r >= 10 && c >= 10 && (r + c) % 2 == 0)) : ((r - 5.5) * (r - 5.5) + (c - 5) * (c - 5) <= 16 || (r - 9) * (r - 9) + (c - 10.5) * (c - 10.5) <= 16 || (r - 13) * (r - 13) + (c - 2.5) * (c - 2.5) <= 3.5);
    if (t == 0) for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { s = s * 48271 % 2147483647; if (s % 100 < 6) a[r][c] = 1 - a[r][c]; }
    return a;
}

int main() {
    const char *names[3] = {"noisy blobs", "blobs", "diagonal dots"};
    Nb D4 = {{-1, 0}, {0, -1}, {0, 1}, {1, 0}}, D8 = {{-1, -1}, {-1, 0}, {-1, 1}, {0, -1}, {0, 1}, {1, -1}, {1, 0}, {1, 1}};
    for (int t = 0; t < 3; t++) {
        Img A = make(t);
        for (int conn : {4, 8}) {
            // 第一趟看已掃過的鄰居，給新標籤或用並查集合併；第二趟換成代表並重新編號
            Nb prev = conn == 8 ? Nb{{-1, -1}, {-1, 0}, {-1, 1}, {0, -1}} : Nb{{-1, 0}, {0, -1}};
            Img lab(N, vector<int>(N, 0));
            vector<int> parent = {0};
            function<int(int)> find = [&](int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
            for (int r = 0; r < N; r++)
                for (int c = 0; c < N; c++) {
                    if (!A[r][c]) continue;
                    vector<int> nbr;
                    for (auto &d : prev) { int y = r + d.first, x = c + d.second; if (y >= 0 && y < N && x >= 0 && x < N && lab[y][x]) nbr.push_back(lab[y][x]); }
                    if (nbr.empty()) { parent.push_back(parent.size()); lab[r][c] = parent.size() - 1; continue; }
                    lab[r][c] = *min_element(nbr.begin(), nbr.end());
                    for (int v : nbr) { int a = find(v), b = find(lab[r][c]); if (a != b) parent[max(a, b)] = min(a, b); }
                }
            map<int, int> remap;
            for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) if (lab[r][c]) { int root = find(lab[r][c]); if (!remap.count(root)) { int id = remap.size() + 1; remap[root] = id; } lab[r][c] = remap[root]; }
            int n = remap.size(), nb = 0;
            Img lb(N, vector<int>(N, 0));
            for (int r = 0; r < N; r++)
                for (int c = 0; c < N; c++) {
                    if (!A[r][c] || lb[r][c]) continue;
                    lb[r][c] = ++nb;
                    queue<pair<int, int>> q;
                    q.push({r, c});
                    while (!q.empty()) {
                        auto p = q.front();
                        q.pop();
                        for (auto &d : conn == 8 ? D8 : D4) { int y = p.first + d.first, x = p.second + d.second; if (y >= 0 && y < N && x >= 0 && x < N && A[y][x] && !lb[y][x]) { lb[y][x] = nb; q.push({y, x}); } }
                    }
                }
            map<int, int> pairs;
            bool same = n == nb;
            for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) if (A[r][c]) { if (!pairs.count(lab[r][c])) pairs[lab[r][c]] = lb[r][c]; else if (pairs[lab[r][c]] != lb[r][c]) same = false; }
            vector<int> sizes(n, 0);
            for (auto &row : lab) for (int v : row) if (v) sizes[v - 1]++;
            sort(sizes.rbegin(), sizes.rend());
            printf("%s, %d-connected: %d components (%d provisional labels), sizes [", names[t], conn, n, (int)parent.size() - 1);
            for (int k = 0; k < n; k++) printf(k ? ", %d" : "%d", sizes[k]);
            printf("], matches BFS %s\n", same ? "True" : "False");
        }
    }
}
