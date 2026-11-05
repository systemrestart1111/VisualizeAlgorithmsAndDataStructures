#include <algorithm>
#include <climits>
#include <cstdio>
#include <map>
#include <utility>
#include <vector>
using namespace std;

const int X = 15;
map<int, pair<int, int>> tree;
int f(const pair<int, int> &l, int x) { return l.first * x + l.second; }

// 每個節點保存在中點較小的直線；另一條只可能在某一半較小，遞迴進入那一半
void insert(pair<int, int> line, int o = 1, int l = 0, int r = X) {
    if (!tree.count(o)) { tree[o] = line; return; }
    int m = (l + r) / 2;
    if (f(line, m) < f(tree[o], m)) swap(line, tree[o]);
    if (l == r) return;
    if (f(line, l) < f(tree[o], l)) insert(line, 2 * o, l, m);
    else if (f(line, r) < f(tree[o], r)) insert(line, 2 * o + 1, m + 1, r);
}
int query(int x) {
    int o = 1, l = 0, r = X, best = INT_MAX;
    while (tree.count(o)) {
        best = min(best, f(tree[o], x));
        if (l == r) break;
        int m = (l + r) / 2;
        if (x <= m) { o = 2 * o; r = m; } else { o = 2 * o + 1; l = m + 1; }
    }
    return best;
}

int main() {
    vector<pair<int, int>> lines = {{1, 2}, {-1, 10}, {0, 6}, {2, -6}, {-2, 20}, {1, 3}};
    for (auto &ln : lines) insert(ln);
    for (int x = 0; x <= X; x += 3) {
        int brute = INT_MAX;
        for (auto &ln : lines) brute = min(brute, f(ln, x));
        printf("x = %2d: li chao %d, brute %d\n", x, query(x), brute);
    }
}
