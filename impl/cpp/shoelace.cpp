#include <cstdio>
#include <cstdlib>
#include <vector>
using namespace std;
typedef long long ll;
struct Pt { ll x, y; };

ll cross(Pt o, Pt a, Pt b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }
bool on(Pt p, Pt q, Pt x) { return min(p.x, q.x) <= x.x && x.x <= max(p.x, q.x) && min(p.y, q.y) <= x.y && x.y <= max(p.y, q.y); }
// 閉線段是否相交（含端點接觸）
bool touch(Pt a, Pt b, Pt c, Pt d) {
    ll d1 = cross(c, d, a), d2 = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d);
    if (d1 && d2 && d3 && d4 && ((d1 > 0) != (d2 > 0)) && ((d3 > 0) != (d4 > 0))) return true;
    return (!d1 && on(c, d, a)) || (!d2 && on(c, d, b)) || (!d3 && on(a, b, c)) || (!d4 && on(a, b, d));
}
bool isSimple(const vector<Pt> &P) {
    int n = P.size();
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++) {
            if (j == i + 1 || (i == 0 && j == n - 1)) continue;
            if (touch(P[i], P[(i + 1) % n], P[j], P[(j + 1) % n])) return false;
        }
    return true;
}
ll gcdll(ll a, ll b) { return b ? gcdll(b, a % b) : a; }

int main() {
    vector<vector<Pt>> polys = {{{1, 1}, {7, 2}, {9, 6}, {5, 9}, {4, 5}, {1, 7}}, {{1, 7}, {4, 5}, {5, 9}, {9, 6}, {7, 2}, {1, 1}}, {{0, 0}, {6, 0}, {6, 4}, {3, 2}, {0, 4}}, {{0, 0}, {8, 6}, {8, 0}, {0, 6}}};
    for (auto &P : polys) {
        int n = P.size();
        // S = Σ (xᵢ·yᵢ₊₁ − xᵢ₊₁·yᵢ)；有向面積 S/2，正為逆時針
        ll s = 0, B = 0;
        for (int i = 0; i < n; i++) { int j = (i + 1) % n; s += P[i].x * P[j].y - P[j].x * P[i].y; }
        double A = s / 2.0;
        if (!isSimple(P)) { printf("signed area %.1f, but polygon is not simple: result is not its area\n", A); continue; }
        for (int i = 0; i < n; i++) { int j = (i + 1) % n; B += gcdll(llabs(P[j].x - P[i].x), llabs(P[j].y - P[i].y)); }
        double absA = A < 0 ? -A : A;
        printf("signed area %.1f (%s), area %.1f, Pick: B = %lld, I = %.0f\n", A, A > 0 ? "counter-clockwise" : "clockwise", absA, B, absA - B / 2.0 + 1);
    }
}
