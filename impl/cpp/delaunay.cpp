#include <algorithm>
#include <array>
#include <cstdio>
#include <map>
#include <utility>
#include <vector>
using namespace std;

typedef array<int, 3> Tri;
vector<pair<long long, long long>> P = {{3, 3}, {12, 4}, {7, 9}, {2, 13}, {15, 12}, {10, 16}, {17, 7}, {8, 2}, {5, 6},
                                        {-1000, -1000}, {1000, -1000}, {0, 1000}};  // 最後三點是包住所有點的超級三角形
const int N = 9;

long long orient(int a, int b, int c) {
    return (P[b].first - P[a].first) * (P[c].second - P[a].second) - (P[b].second - P[a].second) * (P[c].first - P[a].first);
}

// 點 d 是否在三角形 t 的外接圓內（整數行列式，沒有浮點誤差）
bool inCircumcircle(Tri t, int d) {
    if (orient(t[0], t[1], t[2]) < 0) swap(t[1], t[2]);  // 調整成逆時針
    long long r[3][3];
    for (int i = 0; i < 3; i++) {
        long long x = P[t[i]].first - P[d].first, y = P[t[i]].second - P[d].second;
        r[i][0] = x; r[i][1] = y; r[i][2] = x * x + y * y;
    }
    long long det = r[0][0] * (r[1][1] * r[2][2] - r[2][1] * r[1][2]) - r[0][1] * (r[1][0] * r[2][2] - r[2][0] * r[1][2]) +
                    r[0][2] * (r[1][0] * r[2][1] - r[2][0] * r[1][1]);
    return det > 0;
}

// Bowyer–Watson：逐一加入點；刪掉外接圓包含新點的三角形，留下的多邊形空洞再與新點連成三角形
int main() {
    vector<Tri> tris = {{N, N + 1, N + 2}};
    for (int p = 0; p < N; p++) {
        vector<Tri> keep;
        map<pair<int, int>, int> cnt;
        vector<pair<int, int>> order;
        for (Tri t : tris) {
            if (!inCircumcircle(t, p)) { keep.push_back(t); continue; }
            for (int k = 0; k < 3; k++) {
                pair<int, int> e = {min(t[k], t[(k + 1) % 3]), max(t[k], t[(k + 1) % 3])};
                if (!cnt[e]++) order.push_back(e);
            }
        }
        tris = keep;
        for (auto& e : order) if (cnt[e] == 1) tris.push_back({e.first, e.second, p});  // 只出現一次的邊是空洞的邊界
    }
    vector<Tri> res;
    for (Tri t : tris) {
        if (*max_element(t.begin(), t.end()) >= N) continue;  // 去掉碰到超級三角形的三角形
        sort(t.begin(), t.end());
        res.push_back(t);
    }
    sort(res.begin(), res.end());
    printf("triangles: %d\n", (int)res.size());
    for (Tri t : res) {
        printf("  (%d, %d, %d)", t[0], t[1], t[2]);
        for (int v : t) printf(" (%lld,%lld)", P[v].first, P[v].second);
        printf("\n");
    }
}
