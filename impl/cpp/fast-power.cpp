#include <iostream>
using namespace std;

// 把 n 看成二進位，由低位到高位：base 每次平方，該位是 1 時就乘進結果，只需 O(log n) 次乘法
long long fastPower(long long a, long long n) {
    long long result = 1, base = a;
    while (n) {
        int bit = n & 1;
        if (bit) result *= base;
        cout << "bit " << bit << ": result = " << result << ", base = " << base << "\n";
        base *= base;
        n >>= 1;
    }
    return result;
}

int main() { cout << "3^13 = " << fastPower(3, 13) << "\n"; }
