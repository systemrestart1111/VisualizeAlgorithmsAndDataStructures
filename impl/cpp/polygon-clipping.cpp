#include <cstdio>
#include <vector>
using namespace std;

struct P { double x, y; };
double cross(P o, P a, P b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }

// 線段 pq 與直線 ab 的交點
P intersect(P p, P q, P a, P b) {
    double t = cross(a, b, p) / (cross(a, b, p) - cross(a, b, q));
    return {p.x + (q.x - p.x) * t, p.y + (q.y - p.y) * t};
}

// Sutherland–Hodgman：依序用裁切窗的每一條邊去裁多邊形，只保留在邊左側（內側）的部分
vector<P> clip(vector<P> out, const vector<P>& win) {
    for (size_t i = 0; i < win.size(); i++) {
        P a = win[i], b = win[(i + 1) % win.size()];
        vector<P> in = out;
        out.clear();
        for (size_t k = 0; k < in.size(); k++) {
            P p = in[k], q = in[(k + 1) % in.size()];
            bool pin = cross(a, b, p) >= 0, qin = cross(a, b, q) >= 0;
            if (pin && qin) out.push_back(q);
            else if (pin && !qin) out.push_back(intersect(p, q, a, b));
            else if (!pin && qin) { out.push_back(intersect(p, q, a, b)); out.push_back(q); }
        }
    }
    return out;
}

int main() {
    vector<P> res = clip({{1, 4}, {5, 11}, {9, 6}, {13, 10}, {12, 2}, {6, 0}}, {{3, 2}, {11, 2}, {11, 8}, {3, 8}});  // 裁切窗：凸多邊形，逆時針
    printf("clipped polygon: %d vertices\n", (int)res.size());
    for (P p : res) printf("  (%.4f, %.4f)\n", p.x, p.y);
}
