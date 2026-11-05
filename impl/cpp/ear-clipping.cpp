#include <algorithm>
#include <cmath>
#include <cstdio>
#include <vector>
using namespace std;
struct Pt { double x, y; };

double cross(Pt o, Pt a, Pt b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }
double area(const vector<Pt> &P) { double s = 0; for (size_t i = 0; i < P.size(); i++) { size_t j = (i + 1) % P.size(); s += P[i].x * P[j].y - P[j].x * P[i].y; } return s / 2; }

// 凸頂點且三角形內沒有其他頂點 → 耳朵；切下來直到剩一個三角形
vector<vector<int>> earClipping(const vector<Pt> &P) {
    vector<int> idx;
    for (size_t i = 0; i < P.size(); i++) idx.push_back(i);
    if (area(P) < 0) reverse(idx.begin(), idx.end());
    vector<vector<int>> tris;
    while (idx.size() > 3) {
        int m = idx.size();
        bool clipped = false;
        for (int k = 0; k < m && !clipped; k++) {
            int p = idx[(k + m - 1) % m], i = idx[k], q = idx[(k + 1) % m];
            if (cross(P[p], P[i], P[q]) <= 1e-12) continue; // 凹頂點
            bool inside = false;
            for (int j : idx) {
                if (j == p || j == i || j == q) continue;
                if (cross(P[p], P[i], P[j]) >= -1e-12 && cross(P[i], P[q], P[j]) >= -1e-12 && cross(P[q], P[p], P[j]) >= -1e-12) inside = true;
            }
            if (inside) continue;
            tris.push_back({p, i, q});
            idx.erase(idx.begin() + k);
            clipped = true;
        }
        if (!clipped) return {};
    }
    tris.push_back(idx);
    return tris;
}

int main() {
    vector<vector<Pt>> polys = {{{0, 0}, {8, 0}, {8, 6}, {5, 3}, {3, 7}, {1, 4}}, {{0, 0}, {10, 0}, {10, 8}, {7, 8}, {7, 3}, {3, 3}, {3, 8}, {0, 8}}, {{1, 4}, {3, 7}, {5, 3}, {8, 6}, {8, 0}, {0, 0}}};
    for (auto &P : polys) {
        auto tris = earClipping(P);
        double total = 0;
        printf("%d vertices -> %d triangles:", (int)P.size(), (int)tris.size());
        for (auto &t : tris) { total += fabs(area({P[t[0]], P[t[1]], P[t[2]]})); printf(" %d-%d-%d", t[0], t[1], t[2]); }
        printf("; area sum %.2f = shoelace %.2f\n", total, fabs(area(P)));
    }
}
