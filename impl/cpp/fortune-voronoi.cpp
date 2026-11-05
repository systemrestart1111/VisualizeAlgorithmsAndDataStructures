#include <algorithm>
#include <cmath>
#include <cstdio>
#include <vector>
using namespace std;

struct Pt { double x, y; };
struct Arc { int site, ev, id; };
struct Ev { double y, cx, cy, r; int site, arc; bool valid; };

bool circum(Pt a, Pt b, Pt c, double &ux, double &uy, double &r) {
    double d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
    if (fabs(d) < 1e-12) return false;
    double A = a.x * a.x + a.y * a.y, B = b.x * b.x + b.y * b.y, C = c.x * c.x + c.y * c.y;
    ux = (A * (b.y - c.y) + B * (c.y - a.y) + C * (a.y - b.y)) / d;
    uy = (A * (c.x - b.x) + B * (a.x - c.x) + C * (b.x - a.x)) / d;
    r = hypot(a.x - ux, a.y - uy);
    return true;
}
// 焦點 s、準線 y = L 的拋物線在 x 的高度
double parab(Pt s, double L, double x) { return fabs(s.y - L) < 1e-12 ? INFINITY : ((x - s.x) * (x - s.x) + s.y * s.y - L * L) / (2 * (s.y - L)); }
// 左弧 a 與右弧 b 的斷點：兩拋物線的交點中，左邊由 a 較低的那一個
double breakX(Pt a, Pt b, double L) {
    double da = 2 * (a.y - L), db = 2 * (b.y - L);
    if (fabs(da) < 1e-12) return a.x;
    if (fabs(db) < 1e-12) return b.x;
    double A = 1 / da - 1 / db, B = -2 * (a.x / da - b.x / db), C = (a.x * a.x + a.y * a.y - L * L) / da - (b.x * b.x + b.y * b.y - L * L) / db;
    if (fabs(A) < 1e-12) return -C / B;
    double disc = sqrt(max(0.0, B * B - 4 * A * C)), r0 = (-B - disc) / (2 * A), r1 = (-B + disc) / (2 * A);
    double eps = 1e-6 * (1 + fabs(r0) + fabs(r1));
    if (parab(a, L, r0 - eps) < parab(b, L, r0 - eps)) return r0;
    if (parab(a, L, r1 - eps) < parab(b, L, r1 - eps)) return r1;
    return r0;
}
vector<Pt> uniqSorted(const vector<Pt> &v) {
    vector<Pt> out;
    for (auto &p : v) { bool dup = false; for (auto &q : out) if (hypot(p.x - q.x, p.y - q.y) <= 1e-6) dup = true; if (!dup) out.push_back(p); }
    sort(out.begin(), out.end(), [](const Pt &a, const Pt &b) { return a.x != b.x ? a.x < b.x : a.y < b.y; });
    return out;
}

// 掃描線由上往下；站點事件切開弧，圓事件讓弧消失並產生 Voronoi 頂點
vector<Pt> fortune(const vector<Pt> &S) {
    double xmin = 1e18, xmax = -1e18, ymax = -1e18;
    for (auto &p : S) { xmin = min(xmin, p.x); xmax = max(xmax, p.x); ymax = max(ymax, p.y); }
    double scale = xmax - xmin + 6, L = ymax + 3;
    vector<Arc> beach;
    vector<Ev> ev;
    vector<bool> used;
    vector<Pt> verts;
    int nextId = 0;
    for (size_t i = 0; i < S.size(); i++) { ev.push_back({S[i].y, 0, 0, 0, (int)i, -1, true}); used.push_back(false); }
    auto check = [&](int k) {
        if (k < 1 || k + 1 >= (int)beach.size() || beach[k - 1].site == beach[k + 1].site) return;
        Pt a = S[beach[k - 1].site], b = S[beach[k].site], c = S[beach[k + 1].site];
        double ux, uy, r;
        if (!circum(a, b, c, ux, uy, r)) return;
        double yb = uy - r, tol = 1e-5 * scale;
        if (yb > L + 1e-9) return;
        if (fabs(breakX(a, b, yb) - ux) > tol || fabs(breakX(b, c, yb) - ux) > tol) return;
        ev.push_back({yb, ux, uy, r, -1, beach[k].id, true});
        used.push_back(false);
        beach[k].ev = ev.size() - 1;
    };
    auto kill = [&](int k) { if (beach[k].ev >= 0) ev[beach[k].ev].valid = false; beach[k].ev = -1; };
    for (;;) {
        int best = -1;
        for (size_t i = 0; i < ev.size(); i++) {
            if (used[i]) continue;
            if (best < 0 || ev[i].y > ev[best].y || (ev[i].y == ev[best].y && ev[i].site >= 0 && ev[best].site < 0)) best = i;
        }
        if (best < 0) break;
        used[best] = true;
        if (!ev[best].valid) continue;
        Ev e = ev[best];
        L = e.y;
        if (e.site >= 0) {
            int p = e.site;
            if (beach.empty()) { beach.push_back({p, -1, nextId++}); continue; }
            int k = 0;
            while (k + 1 < (int)beach.size() && breakX(S[beach[k].site], S[beach[k + 1].site], L) < S[p].x) k++;
            int old = beach[k].site;
            kill(k);
            beach[k] = {old, -1, nextId++};
            beach.insert(beach.begin() + k + 1, {Arc{p, -1, nextId++}, Arc{old, -1, nextId++}});
            check(k);
            check(k + 2);
        } else {
            int k = -1;
            for (size_t i = 0; i < beach.size(); i++) if (beach[i].id == e.arc) k = i;
            if (k < 1 || k + 1 >= (int)beach.size()) continue;
            verts.push_back({e.cx, e.cy});
            beach.erase(beach.begin() + k);
            kill(k - 1);
            kill(k);
            check(k - 1);
            check(k);
        }
    }
    return uniqSorted(verts);
}
// 暴力：外接圓內沒有其他站點的三點組，圓心就是 Voronoi 頂點
vector<Pt> brute(const vector<Pt> &S) {
    vector<Pt> out;
    int n = S.size();
    for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) for (int k = j + 1; k < n; k++) {
        double ux, uy, r;
        if (!circum(S[i], S[j], S[k], ux, uy, r)) continue;
        bool empty = true;
        for (auto &s : S) if (hypot(s.x - ux, s.y - uy) < r - 1e-7) empty = false;
        if (empty) out.push_back({ux, uy});
    }
    return uniqSorted(out);
}
double f3(double v) { return fabs(v) < 5e-4 ? 0.0 : v; }

int main() {
    long long seed = 11;
    auto rnd = [&]() { seed = seed * 48271 % 2147483647; return seed; };
    vector<Pt> t2;
    for (int i = 0; i < 12; i++) { double x = rnd() % 100000 / 5000.0; double y = rnd() % 100000 / 5000.0; t2.push_back({x, y}); }
    vector<vector<Pt>> tests = {{{3, 3}, {12, 4}, {7, 9}, {2, 13}, {15, 12}, {10, 16}, {17, 7}}, t2, {{0, 0}, {10, 1}, {5, 9}}};
    for (auto &S : tests) {
        auto v = fortune(S), b = brute(S);
        bool same = v.size() == b.size();
        for (size_t i = 0; same && i < v.size(); i++) if (hypot(v[i].x - b[i].x, v[i].y - b[i].y) >= 1e-6) same = false;
        printf("%d sites: %d Voronoi vertices (brute force agrees %s)\n ", (int)S.size(), (int)v.size(), same ? "True" : "False");
        for (auto &p : v) printf(" (%.3f, %.3f)", f3(p.x), f3(p.y));
        printf("\n");
    }
}
