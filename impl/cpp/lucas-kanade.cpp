#include <algorithm>
#include <cmath>
#include <cstdio>
#include <string>
using namespace std;

double smooth(double t) { return t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t); }
// 上方平坦、左側只有垂直條紋（孔徑問題）、右下是二維紋理
double tex(double y, double x) { return 128 + smooth(y - 4) * (50 * sin(0.5 * x) + smooth((x - 7) / 2) * (40 * sin(0.45 * y + 0.3 * x) + 30 * cos(0.35 * x - 0.4 * y))); }

// Ix·u + Iy·v + It = 0 在 5×5 視窗內以最小平方求解；依特徵值判斷可靠／孔徑問題／平坦
void lucasKanade(double du, double dv) {
    double I1[16][16], I2[16][16], Ix[16][16], Iy[16][16];
    for (int r = 0; r < 16; r++) for (int c = 0; c < 16; c++) { I1[r][c] = tex(r, c); I2[r][c] = tex(r - dv, c - du); }
    for (int r = 0; r < 16; r++)
        for (int c = 0; c < 16; c++) {
            Ix[r][c] = c > 0 && c < 15 ? (I1[r][c + 1] - I1[r][c - 1]) / 2 : 0;
            Iy[r][c] = r > 0 && r < 15 ? (I1[r + 1][c] - I1[r - 1][c]) / 2 : 0;
        }
    string out;
    char buf[64];
    for (int i : {1, 8, 12})
        for (int j : {2, 4, 11, 13}) {
            double a = 0, b = 0, c = 0, bx = 0, by = 0;
            for (int y = max(1, i - 2); y <= min(14, i + 2); y++)
                for (int x = max(1, j - 2); x <= min(14, j + 2); x++) {
                    double it = I2[y][x] - I1[y][x];
                    a += Ix[y][x] * Ix[y][x]; b += Ix[y][x] * Iy[y][x]; c += Iy[y][x] * Iy[y][x];
                    bx -= Ix[y][x] * it; by -= Iy[y][x] * it;
                }
            double tr = a + c, det = a * c - b * b, disc = sqrt(max(0.0, (tr / 2) * (tr / 2) - det));
            double l1 = tr / 2 + disc, l2 = tr / 2 - disc;
            if (!out.empty()) out += "; ";
            snprintf(buf, sizeof buf, "(%d,%d) ", i, j);
            out += buf;
            if (l1 < 200) out += "flat";
            else if (l2 < 0.05 * l1) out += "aperture";
            else {
                double u = (c * bx - b * by) / det, v = (a * by - b * bx) / det;
                snprintf(buf, sizeof buf, "(%.2f, %.2f)", fabs(u) < 0.005 ? 0.0 : u, fabs(v) < 0.005 ? 0.0 : v);
                out += buf;
            }
        }
    printf("true (%g, %g): %s\n", du, dv, out.c_str());
}

int main() {
    lucasKanade(1, 0.5);
    lucasKanade(0.5, 0);
    lucasKanade(0, 1);
    lucasKanade(3, 2);
}
