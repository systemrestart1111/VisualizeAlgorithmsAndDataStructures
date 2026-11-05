#include <cstdio>

long long state = 42;

// Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1
long long randInt(long long k) {
    state = state * 48271 % 2147483647;
    return state % k;
}

// 在邊長 R 的正方形內隨機撒點，落在四分之一圓內的比例 ≈ π/4（座標用整數，避免浮點誤差）
int main() {
    long long R = 100000, inside = 0;
    int N = 2000;
    for (int i = 1; i <= N; i++) {
        long long x = randInt(R), y = randInt(R);
        if (x * x + y * y < R * R) inside++;
        if (i == 100 || i == 500 || i == 1000 || i == 2000) printf("n = %4d: pi ~ %.4f\n", i, 4.0 * inside / i);
    }
}
