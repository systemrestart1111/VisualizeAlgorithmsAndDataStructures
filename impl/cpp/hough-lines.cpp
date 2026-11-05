#include <cmath>
#include <cstdio>
#include <string>
#include <vector>
using namespace std;
const int N = 16, TH = 60;

int main() {
    vector<vector<int>> E(N, vector<int>(N, 0));
    for (int c = 1; c <= 14; c++) E[4][c] = 1;
    for (int k = 1; k <= 14; k++) E[15 - k][k] = 1;
    for (int r = 7; r <= 15; r++) E[r][12] = 1;
    const double PI = acos(-1.0);
    int D = (int)ceil(hypot(N, N)), npts = 0;
    vector<vector<int>> acc(2 * D + 1, vector<int>(TH, 0));
    vector<double> cs(TH), sn(TH);
    for (int t = 0; t < TH; t++) { cs[t] = cos(t * 3 * PI / 180); sn[t] = sin(t * 3 * PI / 180); }
    // 每個邊緣點對 θ = 0°, 3°, …, 177° 投票給 ρ = round(x cos θ + y sin θ)
    for (int y = 0; y < N; y++)
        for (int x = 0; x < N; x++) {
            if (!E[y][x]) continue;
            npts++;
            for (int t = 0; t < TH; t++) acc[(int)floor(x * cs[t] + y * sn[t] + 0.5) + D][t]++;
        }
    for (int thr : {8, 12}) {
        string out;
        // 取 5×5 鄰域內的峰值（θ 跨過 180° 時 ρ 變號）
        for (int i = 0; i <= 2 * D; i++)
            for (int t = 0; t < TH; t++) {
                if (acc[i][t] < thr) continue;
                bool ok = true;
                for (int a = -2; a <= 2; a++)
                    for (int b = -2; b <= 2; b++) {
                        if (!a && !b) continue;
                        int y = i + a, tt = ((t + b) % TH + TH) % TH, yy = (t + b < 0 || t + b >= TH) ? 2 * D - y : y;
                        if (yy >= 0 && yy <= 2 * D && (acc[yy][tt] > acc[i][t] || (acc[yy][tt] == acc[i][t] && (a < 0 || (a == 0 && b < 0))))) ok = false;
                    }
                if (ok) out += (out.empty() ? "" : "; ") + string("theta ") + to_string(t * 3) + ", rho " + to_string(i - D) + ", votes " + to_string(acc[i][t]);
            }
        printf("%d edge points, threshold %d: %s\n", npts, thr, out.c_str());
    }
}
