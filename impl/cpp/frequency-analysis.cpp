#include <algorithm>
#include <cstdio>
#include <numeric>
#include <string>
#include <vector>
using namespace std;

const double EN[26] = {8.17, 1.49, 2.78, 4.25, 12.7, 2.23, 2.02, 6.09, 6.97, 0.15, 0.77, 4.03, 2.41, 6.75, 7.51, 1.93, 0.1, 5.99, 6.33, 9.06, 2.76, 0.98, 2.36, 0.15, 1.97, 0.07};

int main() {
    string cipher = "WKH TXLFN EURZQ IRA MXPSV RYHU WKH ODCB GRJ. IUHTXHQFB DQDOBVLV LV D FODVVLF ZDB WR EUHDN VXEVWLWXWLRQ FLSKHUV";
    int cnt[26] = {0}, n = 0;
    for (char c : cipher) if (c >= 'A' && c <= 'Z') { cnt[c - 'A']++; n++; }
    printf("counts:");
    for (int i = 0; i < 26; i++) if (cnt[i]) printf(" %c%d", 'A' + i, cnt[i]);
    printf("\n");
    // 對每個位移計算卡方距離，越小越像英文
    vector<double> chi(26);
    for (int k = 0; k < 26; k++)
        for (int c = 0; c < 26; c++) { double e = n * EN[c] / 100, d = cnt[(c + k) % 26] - e; chi[k] += d * d / e; }
    vector<int> order(26);
    iota(order.begin(), order.end(), 0);
    stable_sort(order.begin(), order.end(), [&](int a, int b) { return chi[a] < chi[b]; });
    for (int i = 0; i < 3; i++) printf("shift %d: chi2 = %.2f\n", order[i], chi[order[i]]);
    int best = order[0];
    for (char &c : cipher) if (c >= 'A' && c <= 'Z') c = char('A' + (c - 'A' - best + 26) % 26);
    printf("plain: %s\n", cipher.c_str());
}
