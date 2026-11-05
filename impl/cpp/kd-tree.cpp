#include <algorithm>
#include <cmath>
#include <cstdio>
#include <vector>
using namespace std;

struct P { int x, y; int get(int a) const { return a ? y : x; } };
struct KD { P p; int axis; KD *left = nullptr, *right = nullptr; };

// 交替以 x、y 的中位數切分
KD *build(vector<P> pts, int depth) {
    if (pts.empty()) return nullptr;
    int axis = depth % 2;
    sort(pts.begin(), pts.end(), [&](const P &a, const P &b) { return a.get(axis) != b.get(axis) ? a.get(axis) < b.get(axis) : a.get(1 - axis) < b.get(1 - axis); });
    size_t m = pts.size() / 2;
    KD *n = new KD{pts[m], axis};
    n->left = build(vector<P>(pts.begin(), pts.begin() + m), depth + 1);
    n->right = build(vector<P>(pts.begin() + m + 1, pts.end()), depth + 1);
    return n;
}
// 先走查詢點所在的一側；到切分線的距離小於目前最近距離才檢查另一側
void go(KD *n, const P &q, P &best, long long &bd, int &visited) {
    if (!n) return;
    visited++;
    long long d = 1LL * (n->p.x - q.x) * (n->p.x - q.x) + 1LL * (n->p.y - q.y) * (n->p.y - q.y);
    if (d < bd) { bd = d; best = n->p; }
    long long diff = q.get(n->axis) - n->p.get(n->axis);
    KD *near = diff < 0 ? n->left : n->right, *far = diff < 0 ? n->right : n->left;
    go(near, q, best, bd, visited);
    if (diff * diff < bd) go(far, q, best, bd, visited);
}

int main() {
    vector<P> pts = {{30, 40}, {5, 25}, {70, 70}, {10, 12}, {50, 30}, {35, 45}, {80, 15}, {60, 85}, {20, 75}, {90, 55}, {45, 60}};
    KD *root = build(pts, 0);
    printf("root: (%d, %d) | left: (%d, %d) | right: (%d, %d)\n", root->p.x, root->p.y, root->left->p.x, root->left->p.y, root->right->p.x, root->right->p.y);
    for (P q : vector<P>{{52, 52}, {12, 20}, {95, 95}, {0, 100}}) {
        P best{};
        long long bd = (long long)1e18, brute = (long long)1e18;
        int visited = 0;
        go(root, q, best, bd, visited);
        for (auto &p : pts) brute = min(brute, 1LL * (p.x - q.x) * (p.x - q.x) + 1LL * (p.y - q.y) * (p.y - q.y));
        printf("nearest to (%d, %d): (%d, %d) dist %.2f visited %d/%d brute %.2f\n", q.x, q.y, best.x, best.y, sqrt((double)bd), visited, (int)pts.size(), sqrt((double)brute));
    }
}
