#include <cctype>
#include <iostream>
#include <string>
using namespace std;

// 關鍵字字母決定位移；非字母原樣輸出且不消耗關鍵字位置
string vigenere(const string &text, const string &key, bool decrypt = false) {
    string out;
    size_t j = 0;
    for (char ch : text) {
        if (!isalpha((unsigned char)ch)) { out += ch; continue; }
        int k = toupper(key[j % key.size()]) - 'A';
        if (decrypt) k = 26 - k;
        char base = isupper((unsigned char)ch) ? 'A' : 'a';
        out += char(base + (ch - base + k) % 26);
        j++;
    }
    return out;
}

int main() {
    string c = vigenere("ATTACK AT DAWN!", "LEMON");
    cout << "cipher: " << c << "\n";
    cout << "plain : " << vigenere(c, "LEMON", true) << "\n";
    cout << "mixed : " << vigenere("Hello, World", "key") << "\n";
}
