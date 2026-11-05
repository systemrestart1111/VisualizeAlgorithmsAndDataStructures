#include <iostream>
#include <stdexcept>
#include <string>
using namespace std;

int gcd(int a, int b) { return b ? gcd(b, a % b) : a; }

// E(x) = (a·x + b) mod 26；D(y) = a⁻¹·(y − b) mod 26；a 必須與 26 互質
string affine(const string &text, int a, int b, bool decrypt = false) {
    if (gcd(a, 26) != 1) throw invalid_argument("a 與 26 不互質");
    int ai = 1;
    while (a * ai % 26 != 1) ai++;
    string out = text;
    for (char &ch : out) {
        bool up = ch >= 'A' && ch <= 'Z', low = ch >= 'a' && ch <= 'z';
        if (!up && !low) continue;
        char base = up ? 'A' : 'a';
        int x = ch - base;
        int y = decrypt ? ((ai * (x - b)) % 26 + 26) % 26 : (a * x + b) % 26;
        ch = char(base + y);
    }
    return out;
}

int main() {
    string c = affine("AFFINE CIPHER", 5, 8);
    cout << "cipher: " << c << "\n";
    cout << "plain : " << affine(c, 5, 8, true) << "\n";
    try { affine("TEST", 13, 1); } catch (const invalid_argument &) { cout << "a=13 rejected\n"; }
}
