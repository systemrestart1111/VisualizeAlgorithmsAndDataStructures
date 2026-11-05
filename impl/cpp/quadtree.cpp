#include <algorithm>
#include <cstdio>
#include <memory>
#include <utility>
#include <vector>
using namespace std;
using P = pair<int, int>;

const int CAP = 1, MAXD = 5;
struct QT {
    int x0, y0, s, depth;
    vector<P> pts;
    vector<unique_ptr<QT>> kids;
    QT(int x0, int y0, int s, int d) : x0(x0), y0(y0), s(s), depth(d) {}
    // 葉格滿了且未達最大深度就分成四格，原本的點往下移
    void insert(P p) {
        if (kids.empty()) {
            if ((int)pts.size() < CAP || depth >= MAXD) { pts.push_back(p); return; }
            int h = s / 2;
            for (auto d : vector<P>{{0, 0}, {h, 0}, {0, h}, {h, h}}) kids.emplace_back(new QT(x0 + d.first, y0 + d.second, h, depth + 1));
            vector<P> old;
            old.swap(pts);
            for (auto &q : old) insert(q);
        }
        int h = s / 2, k = (p.first >= x0 + h ? 1 : 0) + (p.second >= y0 + h ? 2 : 0);
        kids[k]->insert(p);
    }
    // 只走進與查詢矩形相交的格子；回傳拜訪的格子數
    int range(int x1, int y1, int x2, int y2, vector<P> &out) const {
        if (x0 > x2 || x0 + s <= x1 || y0 > y2 || y0 + s <= y1) return 0;
        for (auto &p : pts) if (p.first >= x1 && p.first <= x2 && p.second >= y1 && p.second <= y2) out.push_back(p);
        int v = 1;
        for (auto &c : kids) v += c->range(x1, y1, x2, y2, out);
        return v;
    }
    int count() const { int c = 1; for (auto &k : kids) c += k->count(); return c; }
};

int main() {
    QT root(0, 0, 64, 0);
    for (P p : vector<P>{{10, 10}, {50, 12}, {20, 40}, {30, 35}, {55, 55}, {8, 52}, {40, 20}, {45, 22}, {45, 22}, {45, 22}}) root.insert(p);
    printf("cells: %d\n", root.count());
    int rects[4][4] = {{10, 10, 40, 40}, {40, 10, 63, 30}, {0, 0, 63, 63}, {60, 0, 63, 5}};
    for (auto &r : rects) {
        vector<P> out;
        int v = root.range(r[0], r[1], r[2], r[3], out);
        sort(out.begin(), out.end());
        printf("range (%d, %d, %d, %d): %d points [", r[0], r[1], r[2], r[3], (int)out.size());
        for (size_t i = 0; i < out.size(); i++) printf(i ? ", (%d, %d)" : "(%d, %d)", out[i].first, out[i].second);
        printf("] visited %d\n", v);
    }
}
