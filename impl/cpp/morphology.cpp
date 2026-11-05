#include <cstdio>
#include <string>
#include <vector>
using namespace std;
const int N = 16;
typedef vector<vector<int>> Img;
typedef vector<pair<int, int>> SE;

Img blobs() {
    Img a(N, vector<int>(N));
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++)
            a[r][c] = (r - 5.5) * (r - 5.5) + (c - 5) * (c - 5) <= 16 || (r - 9) * (r - 9) + (c - 10.5) * (c - 10.5) <= 16 || (r - 13) * (r - 13) + (c - 2.5) * (c - 2.5) <= 3.5;
    return a;
}
Img noisyBin() {
    Img a = blobs();
    long long s = 5;
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { s = s * 48271 % 2147483647; if (s % 100 < 6) a[r][c] = 1 - a[r][c]; }
    return a;
}
// 侵蝕：蓋到的全為 1 才為 1；膨脹：蓋到任一為 1 就為 1；邊界外視為 0
Img morph(const Img &a, const SE &se, bool erode) {
    Img out(N, vector<int>(N));
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            bool all = true, any = false;
            for (auto &d : se) {
                int y = r + d.first, x = c + d.second;
                bool v = y >= 0 && y < N && x >= 0 && x < N && a[y][x];
                all = all && v; any = any || v;
            }
            out[r][c] = erode ? all : any;
        }
    return out;
}
int count(const Img &a) { int s = 0; for (auto &row : a) for (int v : row) s += v; return s; }
int components(const Img &a) {
    vector<vector<int>> seen(N, vector<int>(N, 0));
    int n = 0;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            if (!a[r][c] || seen[r][c]) continue;
            n++;
            vector<pair<int, int>> st = {{r, c}};
            seen[r][c] = 1;
            while (!st.empty()) {
                auto p = st.back();
                st.pop_back();
                for (auto d : SE{{-1, 0}, {0, -1}, {0, 1}, {1, 0}}) {
                    int y = p.first + d.first, x = p.second + d.second;
                    if (y >= 0 && y < N && x >= 0 && x < N && a[y][x] && !seen[y][x]) { seen[y][x] = 1; st.push_back({y, x}); }
                }
            }
        }
    return n;
}

int main() {
    SE sq = {{0, 0}, {-1, -1}, {-1, 0}, {-1, 1}, {0, -1}, {0, 1}, {1, -1}, {1, 0}, {1, 1}}, cr = {{0, 0}, {-1, 0}, {0, -1}, {0, 1}, {1, 0}};
    vector<pair<string, Img>> tests = {{"noisy blobs", noisyBin()}, {"blobs", blobs()}};
    for (auto &t : tests)
        for (auto &s : vector<pair<string, SE>>{{"square", sq}, {"cross", cr}}) {
            Img er = morph(t.second, s.second, true), di = morph(t.second, s.second, false);
            Img op = morph(er, s.second, false), cl = morph(di, s.second, true);
            printf("%s, %s: input %d (%d parts), erode %d, dilate %d, open %d (%d parts), close %d (%d parts)\n", t.first.c_str(), s.first.c_str(), count(t.second), components(t.second), count(er), count(di), count(op), components(op), count(cl), components(cl));
        }
}
