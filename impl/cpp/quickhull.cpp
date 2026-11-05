#include <algorithm>
#include <cstdio>
#include <vector>
using namespace std;
typedef pair<double, double> Pt;

double cross(Pt o, Pt a, Pt b) { return (a.first - o.first) * (b.second - o.second) - (a.second - o.second) * (b.first - o.first); }

vector<Pt> S;
// 遞迴找離線段 PQ 最遠的點，三角形內的點丟掉
vector<int> findHull(const vector<int> &pts, int p, int q) {
    if (pts.empty()) return {};
    int f = pts[0];
    for (int i : pts) if (cross(S[p], S[q], S[i]) > cross(S[p], S[q], S[f]) + 1e-12) f = i;
    vector<int> s1, s2;
    for (int i : pts) {
        if (cross(S[p], S[f], S[i]) > 1e-9) s1.push_back(i);
        if (cross(S[f], S[q], S[i]) > 1e-9) s2.push_back(i);
    }
    vector<int> res = findHull(s1, p, f);
    res.push_back(f);
    vector<int> r2 = findHull(s2, f, q);
    res.insert(res.end(), r2.begin(), r2.end());
    return res;
}
vector<Pt> monotone(vector<Pt> p) {
    sort(p.begin(), p.end());
    p.erase(unique(p.begin(), p.end()), p.end());
    if (p.size() < 3) return p;
    vector<Pt> lo, up;
    for (auto &q : p) { while (lo.size() >= 2 && cross(lo[lo.size() - 2], lo.back(), q) <= 1e-9) lo.pop_back(); lo.push_back(q); }
    for (int i = p.size() - 1; i >= 0; i--) { while (up.size() >= 2 && cross(up[up.size() - 2], up.back(), p[i]) <= 1e-9) up.pop_back(); up.push_back(p[i]); }
    lo.pop_back(); up.pop_back();
    lo.insert(lo.end(), up.begin(), up.end());
    return lo;
}

int main() {
    long long s = 7;
    auto rnd = [&](int n) { s = s * 48271 % 2147483647; return (double)(s % n); };
    vector<Pt> t3;
    for (int i = 0; i < 30; i++) { double x = rnd(100); double y = rnd(100); t3.push_back({x, y}); }
    vector<vector<Pt>> tests = {{{3, 1}, {7, 2}, {10, 5}, {6, 4}, {2, 6}, {5, 7}, {8, 9}, {1, 3}, {4, 4}, {9, 7}, {6, 10}, {3, 9}, {7, 6}, {5, 5}}, {{0, 0}, {4, 0}, {4, 4}, {0, 4}, {2, 0}, {2, 2}, {4, 2}, {0, 0}, {0, 2}}, t3};
    for (auto &raw : tests) {
        S.clear();
        for (auto &p : raw) if (find(S.begin(), S.end(), p) == S.end()) S.push_back(p);
        int n = S.size(), A = 0, B = 0;
        for (int i = 1; i < n; i++) { if (S[i] < S[A]) A = i; if (S[i] > S[B]) B = i; }
        vector<int> up, down;
        for (int i = 0; i < n; i++) {
            if (i == A || i == B) continue;
            double c = cross(S[A], S[B], S[i]);
            if (c > 1e-9) up.push_back(i); else if (c < -1e-9) down.push_back(i);
        }
        vector<int> cw = {A};
        for (int i : findHull(up, A, B)) cw.push_back(i);
        cw.push_back(B);
        for (int i : findHull(down, B, A)) cw.push_back(i);
        vector<Pt> h = {S[cw[0]]};
        for (int i = cw.size() - 1; i >= 1; i--) h.push_back(S[cw[i]]);
        vector<Pt> hs = h, ref = monotone(S);
        sort(hs.begin(), hs.end());
        sort(ref.begin(), ref.end());
        printf("hull (%d):", (int)h.size());
        for (auto &p : h) printf(" (%.0f,%.0f)", p.first, p.second);
        printf("; same as monotone chain %s\n", hs == ref ? "True" : "False");
    }
}
