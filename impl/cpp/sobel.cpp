#include <algorithm>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <string>
using namespace std;
const int N = 16;
int A[N][N];

void preset(const string &name) {
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            int v;
            if (name == "shapes") {
                v = 30;
                if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
                if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
                if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
            } else if (name == "step") v = (c < 8 ? 60 : 190) + (r >= 11 ? 40 : 0);
            else v = ((r >> 2) + (c >> 2)) % 2 ? 210 : 40;
            A[r][c] = v;
        }
}
int g(int r, int c) { return A[min(N - 1, max(0, r))][min(N - 1, max(0, c))]; }

int main() {
    int KX[3][3] = {{-1, 0, 1}, {-2, 0, 2}, {-1, 0, 1}}, KY[3][3] = {{-1, -2, -1}, {0, 0, 0}, {1, 2, 1}};
    for (string name : {"shapes", "step", "checker"}) {
        preset(name);
        int gx[N][N], gy[N][N], sx = 0, sy = 0, flat = 0;
        bool zero = true;
        double mx = 0;
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                int a = 0, b = 0;
                for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) { a += KX[i + 1][j + 1] * g(r + i, c + j); b += KY[i + 1][j + 1] * g(r + i, c + j); }
                gx[r][c] = a; gy[r][c] = b;
                sx += abs(a); sy += abs(b);
                mx = max(mx, hypot(a, b));
            }
        for (int r = 1; r < N - 1; r++)
            for (int c = 1; c < N - 1; c++) {
                bool same = true;
                for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) if (A[r + i][c + j] != A[r][c]) same = false;
                if (same) { flat++; if (gx[r][c] || gy[r][c]) zero = false; }
            }
        printf("%s: sum|Gx| = %d, sum|Gy| = %d, Gx(5,7) = %d, Gy(6,4) = %d, max magnitude %.2f, %d flat pixels all zero %s\n", name.c_str(), sx, sy, gx[5][7], gy[6][4], mx, flat, zero ? "True" : "False");
    }
}
