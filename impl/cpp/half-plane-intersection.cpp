#include <algorithm>
#include <cmath>
#include <cstdio>
#include <deque>
#include <vector>
using namespace std;

struct HP { double px, py, dx, dy; bool box; double ang; };
struct Pt { double x, y; };
bool out(const HP &h, Pt x) { return h.dx * (x.y - h.py) - h.dy * (x.x - h.px) < -1e-9; }
Pt inter(const HP &s, const HP &t) {
    double al = ((t.px - s.px) * t.dy - (t.py - s.py) * t.dx) / (s.dx * t.dy - s.dy * t.dx);
    return {s.px + s.dx * al, s.py + s.dy * al};
}
double f3(double v) { return fabs(v) < 5e-4 ? 0.0 : v; }

// 每個 a·x + b·y ≤ c 轉成有向線（可行側在左），加大方框，依角度排序後用雙端佇列
void run(const vector<vector<double>> &cons) {
    vector<HP> H;
    double M = 50;
    for (auto &c : cons) {
        double a = c[0], b = c[1], cc = c[2], n2 = a * a + b * b;
        H.push_back({a * cc / n2, b * cc / n2, -b, a, false, 0});
        M = max(M, fabs(cc) / hypot(a, b));
    }
    M *= 4;
    H.push_back({M, -M, 0, 1, true, 0});
    H.push_back({M, M, -1, 0, true, 0});
    H.push_back({-M, M, 0, -1, true, 0});
    H.push_back({-M, -M, 1, 0, true, 0});
    for (auto &h : H) h.ang = atan2(h.dy, h.dx);
    stable_sort(H.begin(), H.end(), [](const HP &a, const HP &b) { return a.ang < b.ang; });
    deque<HP> dq;
    for (auto &h : H) {
        while (dq.size() >= 2 && out(h, inter(dq[dq.size() - 1], dq[dq.size() - 2]))) dq.pop_back();
        while (dq.size() >= 2 && out(h, inter(dq[0], dq[1]))) dq.pop_front();
        if (!dq.empty() && fabs(h.dx * dq.back().dy - h.dy * dq.back().dx) < 1e-12) {
            if (h.dx * dq.back().dx + h.dy * dq.back().dy < 0) { printf("empty intersection\n"); return; }
            if (out(h, {dq.back().px, dq.back().py})) dq.pop_back();
            else continue;
        }
        dq.push_back(h);
    }
    while (dq.size() >= 3 && out(dq[0], inter(dq[dq.size() - 1], dq[dq.size() - 2]))) dq.pop_back();
    while (dq.size() >= 3 && out(dq.back(), inter(dq[0], dq[1]))) dq.pop_front();
    if (dq.size() < 3) { printf("empty intersection\n"); return; }
    vector<Pt> poly;
    bool boxed = false;
    for (size_t i = 0; i < dq.size(); i++) {
        if (dq[i].box) boxed = true;
        Pt p = inter(dq[i], dq[(i + 1) % dq.size()]);
        if (poly.empty() || hypot(p.x - poly.back().x, p.y - poly.back().y) > 1e-9) poly.push_back(p);
    }
    if (poly.size() > 1 && hypot(poly[0].x - poly.back().x, poly[0].y - poly.back().y) <= 1e-9) poly.pop_back();
    int np = poly.size();
    if (boxed) { printf("unbounded: clipped by the bounding box (%d vertices)\n", np); return; }
    int s = 0;
    for (int i = 1; i < np; i++) {
        long long xi = llround(poly[i].x * 1e6), xs = llround(poly[s].x * 1e6), yi = llround(poly[i].y * 1e6), ys = llround(poly[s].y * 1e6);
        if (xi < xs || (xi == xs && yi < ys)) s = i;
    }
    double area = 0;
    for (int i = 0; i < np; i++) { Pt p = poly[i], q = poly[(i + 1) % np]; area += p.x * q.y - q.x * p.y; }
    printf("%d-gon, area %.3f:", np, f3(fabs(area) / 2));
    for (int i = 0; i < np; i++) { Pt p = poly[(s + i) % np]; printf(" (%.3f, %.3f)", f3(p.x), f3(p.y)); }
    printf("\n");
}

int main() {
    run({{1, 1, 10}, {-1, 0, 0}, {0, -1, 0}, {1, -2, 4}, {-2, 1, 6}, {1, 0, 7}});
    run({{1, 0, 2}, {-1, 0, -5}, {0, 1, 5}, {0, -1, 0}});
    run({{1, 1, 4}, {1, -1, 2}, {-1, 0, 1}, {1, 1, 6}});
    run({{-1, 0, 0}, {0, -1, 0}});
}
