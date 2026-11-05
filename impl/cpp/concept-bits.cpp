#include <bitset>
#include <iostream>
using namespace std;

const int W = 8;
const unsigned MASK = (1u << W) - 1;
string b(unsigned x) { return bitset<W>(x & MASK).to_string(); }

int main() {
    unsigned a = 182, c = 109, k = 3;
    cout << "a      = " << b(a) << " " << a << "\n";
    cout << "b      = " << b(c) << " " << c << "\n";
    cout << "a & b  = " << b(a & c) << " " << (a & c) << "\n";
    cout << "a | b  = " << b(a | c) << " " << (a | c) << "\n";
    cout << "a ^ b  = " << b(a ^ c) << " " << (a ^ c) << "\n";
    cout << "~a     = " << b(~a) << " " << (~a & MASK) << "\n";
    cout << "a << 3 = " << b(a << k) << " " << ((a << k) & MASK) << " (overflow bits: " << ((a << k) >> W) << " )\n";
    cout << "a >> 3 = " << b(a >> k) << " " << (a >> k) << "\n";
    cout << "lowbit = " << b(a & (0u - a)) << " " << (a & (0u - a)) << "\n";
    cout << "bit 3 of a = " << ((a >> k) & 1) << " ; set bit 3 -> " << (a | (1u << k)) << " ; clear bit 2 -> " << (a & ~(1u << 2) & MASK) << "\n";
    cout << "-3 in 8 bits = " << b((unsigned)-3) << "\n";
}
