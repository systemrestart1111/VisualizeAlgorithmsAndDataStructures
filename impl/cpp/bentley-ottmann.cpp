#include <algorithm>
#include <cmath>
#include <cstdio>
#include <set>
#include <vector>
using namespace std;

struct Seg { double ax, ay, bx, by; };
struct Ev { double x, y; int kind, s; };
vector<Seg> L;

double yAt(int i, double x) { return L[i].ay + (L[i].by - L[i].ay) * (x - L[i].ax) / (L[i].bx - L[i].ax); }
bool segX(int i, int j, double &px, double &py) {
    double x1 = L[i].ax, y1 = L[i].ay, x2 = L[i].bx, y2 = L[i].by, x3 = L[j].ax, y3 = L[j].ay, x4 = L[j].bx, y4 = L[j].by;
    double d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
    if (fabs(d) < 1e-12) return false;
    double u = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d, v = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
    if (u < -1e-9 || u > 1 + 1e-9 || v < -1e-9 || v > 1 + 1e-9) return false;
    px = x1 + u * (x2 - x1); py = y1 + u * (y2 - y1);
    return true;
}
pair<long long, long long> key(double x, double y) { return {llround(x * 1e6), llround(y * 1e6)}; }
int rankOf(int k) { return k == 0 ? 1 : k == 1 ? 0 : 2; }
double f3(double v) { return fabs(v) < 5e-4 ? 0.0 : v; }

// 掃描線由左往右；只檢查 status 中新相鄰的一對；同點多線只回報一次
void run(const vector<vector<double>> &raw) {
    L.clear();
    for (auto &r : raw) L.push_back(r[0] < r[2] ? Seg{r[0], r[1], r[2], r[3]} : Seg{r[2], r[3], r[0], r[1]});
    int m = L.size();
    double xmin = 1e18, xmax = -1e18;
    vector<Ev> Q;
    for (int i = 0; i < m; i++) { xmin = min(xmin, L[i].ax); xmax = max(xmax, L[i].bx); Q.push_back({L[i].ax, L[i].ay, 0, i}); Q.push_back({L[i].bx, L[i].by, 2, i}); }
    double delta = (xmax - xmin + 2) * 1e-7;
    auto sortQ = [&]() { stable_sort(Q.begin(), Q.end(), [](const Ev &p, const Ev &q) { if (p.x != q.x) return p.x < q.x; if (p.y != q.y) return p.y < q.y; return rankOf(p.kind) < rankOf(q.kind); }); };
    sortQ();
    vector<int> status;
    set<pair<long long, long long>> queued;
    vector<pair<pair<double, double>, vector<int>>> found;
    auto reorder = [&](double x) { stable_sort(status.begin(), status.end(), [&](int i, int j) { return yAt(i, x + delta) < yAt(j, x + delta); }); };
    while (!Q.empty()) {
        Ev e = Q.front();
        Q.erase(Q.begin());
        set<pair<int, int>> before;
        for (size_t k = 0; k + 1 < status.size(); k++) before.insert({min(status[k], status[k + 1]), max(status[k], status[k + 1])});
        if (e.kind == 0) { status.push_back(e.s); reorder(e.x); }
        else if (e.kind == 2) status.erase(find(status.begin(), status.end(), e.s));
        else {
            vector<int> through;
            for (int i = 0; i < m; i++) if (L[i].ax - 1e-9 <= e.x && e.x <= L[i].bx + 1e-9 && fabs(yAt(i, e.x) - e.y) < 1e-7) through.push_back(i);
            found.push_back({{e.x, e.y}, through});
            reorder(e.x);
        }
        for (size_t k = 0; k + 1 < status.size(); k++) {
            int a = status[k], b = status[k + 1];
            if (before.count({min(a, b), max(a, b)})) continue;
            double px, py;
            if (!segX(a, b, px, py) || px < e.x - 1e-9 || (fabs(px - e.x) <= 1e-9 && py < e.y - 1e-9)) continue;
            if (queued.count(key(px, py))) continue;
            queued.insert(key(px, py));
            Q.push_back({px, py, 1, -1});
        }
        sortQ();
    }
    set<pair<long long, long long>> brute, mine;
    for (int i = 0; i < m; i++) for (int j = i + 1; j < m; j++) { double px, py; if (segX(i, j, px, py)) brute.insert(key(px, py)); }
    for (auto &f : found) mine.insert(key(f.first.first, f.first.second));
    stable_sort(found.begin(), found.end(), [](const pair<pair<double, double>, vector<int>> &p, const pair<pair<double, double>, vector<int>> &q) { return p.first < q.first; });
    printf("%d intersections (brute force agrees %s)\n", (int)found.size(), brute == mine ? "True" : "False");
    for (auto &f : found) {
        printf("  (%.3f, %.3f): segments", f3(f.first.first), f3(f.first.second));
        for (int i : f.second) printf(" %d", i);
        printf("\n");
    }
}

int main() {
    run({{1, 2, 9, 8}, {1, 7, 8, 1}, {3, 1, 10, 6}, {2, 9, 11, 3}, {4, 5, 12, 5}, {6, 8, 12, 9}});
    run({{0, 0, 10, 10}, {0, 10, 10, 0}, {0, 5, 10, 5}, {2, 8, 4, 9}});
    run({{0, 0, 5, 5}, {5, 5, 10, 0}, {1, 4, 9, 4}});
}
