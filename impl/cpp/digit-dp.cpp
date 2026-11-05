#include <cstring>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

vector<int> digits;
long long memo[12][120][2];

// 數位 DP：由高位往低位填數字；tight 表示前面都和 N 相同（這一位不能超過 N 的對應位）
long long go(int pos, int rest, bool tight) {
    if (rest < 0) return 0;
    if (pos == (int)digits.size()) return rest == 0;
    long long& m = memo[pos][rest][tight];
    if (m >= 0) return m;
    int top = tight ? digits[pos] : 9;
    m = 0;
    for (int d = 0; d <= top; d++) m += go(pos + 1, rest - d, tight && d == top);
    return m;
}

int main() {
    int N = 345, S = 10;
    for (char c : to_string(N)) digits.push_back(c - '0');
    memset(memo, -1, sizeof memo);
    cout << "numbers in [0, " << N << "] with digit sum " << S << ": " << go(0, S, true) << "\n";
    int brute = 0;
    for (int x = 0; x <= N; x++) {
        int s = 0;
        for (int y = x; y; y /= 10) s += y % 10;
        brute += s == S;
    }
    cout << "brute force check: " << brute << "\n";
}
