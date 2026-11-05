#include <algorithm>
#include <cstdio>
#include <cstdlib>
#include <string>
#include <vector>
using namespace std;
const int N = 16;
typedef vector<vector<int>> Img;

Img preset(bool step) {
    Img a(N, vector<int>(N, 30));
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            if (step) { a[r][c] = (c < 8 ? 60 : 190) + (r >= 11 ? 40 : 0); continue; }
            if (r >= 2 && r <= 6 && c >= 2 && c <= 7) a[r][c] = 200;
            if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) a[r][c] = 140;
            if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) a[r][c] = 90;
        }
    return a;
}

// e = |Gx| + |Gy|；M[r][c] = e + min(M[r−1][c−1..c+1])；最後一列取最小，再往上追溯
int findSeam(const Img &A, vector<int> &seam) {
    int W = A[0].size();
    auto g = [&](int r, int c) { return A[min(N - 1, max(0, r))][min(W - 1, max(0, c))]; };
    Img M(N, vector<int>(W));
    for (int r = 0; r < N; r++)
        for (int c = 0; c < W; c++) {
            int gx = g(r - 1, c + 1) + 2 * g(r, c + 1) + g(r + 1, c + 1) - g(r - 1, c - 1) - 2 * g(r, c - 1) - g(r + 1, c - 1);
            int gy = g(r + 1, c - 1) + 2 * g(r + 1, c) + g(r + 1, c + 1) - g(r - 1, c - 1) - 2 * g(r - 1, c) - g(r - 1, c + 1);
            M[r][c] = abs(gx) + abs(gy);
        }
    for (int r = 1; r < N; r++)
        for (int c = 0; c < W; c++) {
            int m = M[r - 1][c];
            if (c > 0) m = min(m, M[r - 1][c - 1]);
            if (c < W - 1) m = min(m, M[r - 1][c + 1]);
            M[r][c] += m;
        }
    seam.assign(N, 0);
    seam[N - 1] = min_element(M[N - 1].begin(), M[N - 1].end()) - M[N - 1].begin();
    for (int r = N - 2; r >= 0; r--) {
        int b = seam[r + 1];
        for (int k : {seam[r + 1] - 1, seam[r + 1] + 1}) if (k >= 0 && k < W && M[r][k] < M[r][b]) b = k;
        seam[r] = b;
    }
    return M[N - 1][seam[N - 1]];
}

int main() {
    for (string name : {"shapes", "step"}) {
        Img A = preset(name == "step");
        for (int s = 1; s <= 3; s++) {
            vector<int> seam;
            int cost = findSeam(A, seam);
            bool ok = true;
            for (int r = 1; r < N; r++) if (abs(seam[r] - seam[r - 1]) > 1) ok = false;
            printf("%s seam %d: cost %d, columns", name.c_str(), s, cost);
            for (int c : seam) printf(" %d", c);
            printf(", connected %s\n", ok ? "True" : "False");
            for (int r = 0; r < N; r++) A[r].erase(A[r].begin() + seam[r]);
        }
        int sum = 0;
        for (auto &row : A) for (int v : row) sum += v;
        printf("%s: width now %d, pixel sum %d\n", name.c_str(), (int)A[0].size(), sum);
    }
}
