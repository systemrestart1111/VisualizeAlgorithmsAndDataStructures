#include <cmath>
#include <complex>
#include <iostream>
#include <vector>
using namespace std;

typedef complex<double> cd;

// 迭代版 Cooley–Tukey：先做位元反轉排列，再由長度 2、4、8… 逐層做蝴蝶運算，O(n log n)
void fft(vector<cd>& a, bool invert) {
    int n = (int)a.size();
    for (int i = 1, j = 0; i < n; i++) {  // 位元反轉
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j |= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        double ang = 2 * acos(-1.0) / len * (invert ? 1 : -1);
        cd wlen(cos(ang), sin(ang));
        for (int i = 0; i < n; i += len) {
            cd w(1);
            for (int k = 0; k < len / 2; k++) {
                cd u = a[i + k], v = a[i + k + len / 2] * w;
                a[i + k] = u + v;
                a[i + k + len / 2] = u - v;
                w *= wlen;
            }
        }
    }
    if (invert)
        for (cd& x : a) x /= n;
}

// 在「點值表示」下多項式相乘只需逐點相乘：FFT → 相乘 → 逆 FFT
vector<long long> multiply(const vector<int>& A, const vector<int>& B) {
    int n = 1;
    while (n < (int)(A.size() + B.size() - 1)) n <<= 1;
    vector<cd> fa(A.begin(), A.end()), fb(B.begin(), B.end());
    fa.resize(n);
    fb.resize(n);
    fft(fa, false);
    fft(fb, false);
    for (int i = 0; i < n; i++) fa[i] *= fb[i];
    fft(fa, true);
    vector<long long> res(A.size() + B.size() - 1);
    for (size_t i = 0; i < res.size(); i++) res[i] = llround(fa[i].real());
    return res;
}

int main() {
    vector<long long> c = multiply({1, 2, 3}, {4, 5, 6});  // 係數由低次到高次
    cout << "A x B =";
    for (long long x : c) cout << " " << x;
    cout << "\n";
}
