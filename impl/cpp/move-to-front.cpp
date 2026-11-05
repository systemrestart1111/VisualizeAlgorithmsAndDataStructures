#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

const string ALPHABET = "abcdefghijklmnopqrstuvwxyz";

// 輸出字元目前的位置，再把它移到最前面
vector<int> encode(const string &s) {
    string table = ALPHABET;
    vector<int> out;
    for (char c : s) { int i = table.find(c); out.push_back(i); table.erase(i, 1); table.insert(table.begin(), c); }
    return out;
}
string decode(const vector<int> &codes) {
    string table = ALPHABET, out;
    for (int i : codes) { char c = table[i]; out += c; table.erase(i, 1); table.insert(table.begin(), c); }
    return out;
}

int main() {
    for (string s : {"bananaaa", "aaabbbccc", "abcabcabc", "annb"}) {
        auto codes = encode(s);
        cout << s << ":";
        for (int c : codes) cout << " " << c;
        cout << " -> " << decode(codes) << "\n";
    }
}
