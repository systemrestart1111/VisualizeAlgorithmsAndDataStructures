#include <iostream>
using namespace std;

// 由高位到低位的平方乘法：每讀一個位元就把結果平方，該位是 1 再乘上 a；全程取模讓數字保持很小
long long modPow(long long a, long long n, long long m) {
    int top = 62;
    while (top > 0 && !(n >> top & 1)) top--;
    long long result = 1;
    for (int b = top; b >= 0; b--) {
        int bit = n >> b & 1;
        result = result * result % m;
        if (bit) result = result * a % m;
        cout << "bit " << bit << ": " << result << "\n";
    }
    return result;
}

int main() { cout << "7^560 mod 561 = " << modPow(7, 560, 561) << "\n"; }
