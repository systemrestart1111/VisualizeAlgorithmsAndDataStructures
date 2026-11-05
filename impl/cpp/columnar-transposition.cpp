#include <algorithm>
#include <cctype>
#include <iostream>
#include <numeric>
#include <string>
#include <vector>
using namespace std;

// 依（字母, 欄號）穩定排序，重複字母保持出現順序
vector<int> colOrder(const string &key) {
    vector<int> o(key.size());
    iota(o.begin(), o.end(), 0);
    stable_sort(o.begin(), o.end(), [&](int a, int b) { return key[a] < key[b]; });
    return o;
}
string encrypt(const string &text, const string &key) {
    string t;
    for (char ch : text) if (isalpha((unsigned char)ch)) t += char(toupper((unsigned char)ch));
    size_t w = key.size();
    while (t.size() % w) t += 'X';
    string out;
    for (int c : colOrder(key))
        for (size_t r = 0; r < t.size() / w; r++) out += t[r * w + c];
    return out;
}
string decrypt(const string &cph, const string &key) {
    size_t w = key.size(), rows = cph.size() / w, k = 0;
    string out(cph.size(), ' ');
    for (int c : colOrder(key))
        for (size_t r = 0; r < rows; r++) out[r * w + c] = cph[k++];
    return out;
}

int main() {
    string c = encrypt("WE ARE DISCOVERED FLEE AT ONCE", "ZEBRAS");
    cout << "cipher: " << c << "\n";
    cout << "plain : " << decrypt(c, "ZEBRAS") << "\n";
    cout << "dup key: " << encrypt("HELLOWORLD", "BANANA") << "\n";
}
