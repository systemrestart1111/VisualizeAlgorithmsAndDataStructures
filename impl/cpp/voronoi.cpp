#include <cmath>
#include <cstdio>
#include <vector>
using namespace std;

struct P { double x, y; };

// 保留滿足 a·x + b·y <= c 的部分（凸多邊形與半平面的交集）
vector<P> clipHalfplane(const vector<P>& poly, double a, double b, double c) {
    vector<P> out;
    for (size_t k = 0; k < poly.size(); k++) {
        P p = poly[k], q = poly[(k + 1) % poly.size()];
        double fp = a * p.x + b * p.y - c, fq = a * q.x + b * q.y - c;
        if (fp <= 0) out.push_back(p);
        if ((fp < 0 && fq > 0) || (fq < 0 && fp > 0)) {
            double t = fp / (fp - fq);
            out.push_back({p.x + (q.x - p.x) * t, p.y + (q.y - p.y) * t});
        }
    }
    return out;
}

double area(const vector<P>& poly) {
    double s = 0;
    for (size_t i = 0; i < poly.size(); i++) s += poly[i].x * poly[(i + 1) % poly.size()].y - poly[(i + 1) % poly.size()].x * poly[i].y;
    return fabs(s) / 2;
}

// 站點 i 的 Voronoi 區域 = 外框依序被「比站點 j 更靠近站點 i」的半平面（垂直平分線的一側）裁切後剩下的部分
int main() {
    vector<P> S = {{3, 3}, {12, 4}, {7, 9}, {2, 13}, {15, 12}, {10, 16}, {17, 7}};
    double x0 = S[0].x, x1 = S[0].x, y0 = S[0].y, y1 = S[0].y;
    for (P s : S) { x0 = fmin(x0, s.x); x1 = fmax(x1, s.x); y0 = fmin(y0, s.y); y1 = fmax(y1, s.y); }
    x0 -= 3; x1 += 3; y0 -= 3; y1 += 3;
    double total = 0;
    for (size_t i = 0; i < S.size(); i++) {
        vector<P> cell = {{x0, y0}, {x1, y0}, {x1, y1}, {x0, y1}};
        for (size_t j = 0; j < S.size(); j++) {
            if (i == j) continue;
            P s = S[i], t = S[j];
            // |P - S|² <= |P - T|²  <=>  2(T - S)·P <= |T|² - |S|²
            cell = clipHalfplane(cell, 2 * (t.x - s.x), 2 * (t.y - s.y), t.x * t.x + t.y * t.y - s.x * s.x - s.y * s.y);
        }
        total += area(cell);
        printf("site %d (%.0f,%.0f): %d vertices, area = %.4f\n", (int)i, S[i].x, S[i].y, (int)cell.size(), area(cell));
    }
    printf("sum of areas = %.4f (box area = %.0f)\n", total, (x1 - x0) * (y1 - y0));
}
