#include <algorithm>
#include <cstdio>
#include <string>
#include <vector>
using namespace std;
const int N = 16;
typedef vector<vector<int>> Img;

Img shapes() {
    Img a(N, vector<int>(N, 30));
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            if (r >= 2 && r <= 6 && c >= 2 && c <= 7) a[r][c] = 200;
            if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) a[r][c] = 140;
            if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) a[r][c] = 90;
        }
    return a;
}
// 超出範圍時依邊界模式取值：補 0、複製邊緣、鏡射
int at(const Img &a, int r, int c, const string &mode) {
    if (r >= 0 && r < N && c >= 0 && c < N) return a[r][c];
    if (mode == "zero") return 0;
    if (mode == "replicate") return a[min(N - 1, max(0, r))][min(N - 1, max(0, c))];
    auto ref = [](int i) { while (i < 0 || i >= N) i = i < 0 ? -i : 2 * (N - 1) - i; return i; };
    return a[ref(r)][ref(c)];
}

int main() {
    Img A = shapes();
    vector<pair<string, vector<vector<int>>>> ks = {{"sharpen", {{0, -1, 0}, {-1, 5, -1}, {0, -1, 0}}}, {"laplace", {{0, 1, 0}, {1, -4, 1}, {0, 1, 0}}}, {"emboss", {{-2, -1, 0}, {-1, 1, 1}, {0, 1, 2}}}};
    for (auto &k : ks)
        for (string mode : {"zero", "replicate", "reflect"}) {
            // 相關運算：核心中心對準像素，對應位置相乘後加總
            Img out(N, vector<int>(N));
            int sum = 0, mn = 1 << 30, mx = -(1 << 30);
            for (int r = 0; r < N; r++)
                for (int c = 0; c < N; c++) {
                    int s = 0;
                    for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) s += k.second[i + 1][j + 1] * at(A, r + i, c + j, mode);
                    out[r][c] = s;
                    sum += s; mn = min(mn, s); mx = max(mx, s);
                }
            printf("%s/%s: sum %d, out(0,0) = %d, out(5,4) = %d, min %d, max %d\n", k.first.c_str(), mode.c_str(), sum, out[0][0], out[5][4], mn, mx);
        }
}
