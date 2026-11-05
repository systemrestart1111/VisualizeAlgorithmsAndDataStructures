#include <cctype>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

string sq;
int pr[26], pc[26];

// 關鍵字（J 視為 I，去重複）接上其餘字母，排成 5×5
void build(const string &key) {
    sq.clear();
    for (char ch : key + "ABCDEFGHIKLMNOPQRSTUVWXYZ") {
        if (!isalpha((unsigned char)ch)) continue;
        ch = char(toupper((unsigned char)ch));
        if (ch == 'J') ch = 'I';
        if (sq.find(ch) == string::npos) { pr[ch - 'A'] = int(sq.size()) / 5; pc[ch - 'A'] = int(sq.size()) % 5; sq += ch; }
    }
}
// 相同字母中間插 X（XX 則插 Q），奇數長度補 X（末字為 X 則補 Q）
vector<string> pairsOf(const string &text) {
    string t;
    for (char ch : text) if (isalpha((unsigned char)ch)) { ch = char(toupper((unsigned char)ch)); t += ch == 'J' ? 'I' : ch; }
    vector<string> out;
    for (size_t i = 0; i < t.size();) {
        char a = t[i], b;
        if (i + 1 >= t.size() || t[i + 1] == a) { b = a == 'X' ? 'Q' : 'X'; i += 1; }
        else { b = t[i + 1]; i += 2; }
        out.push_back(string{a, b});
    }
    return out;
}
vector<string> playfair(const vector<string> &ps, int d) {
    vector<string> res;
    for (auto &p : ps) {
        int a = p[0] - 'A', b = p[1] - 'A', ra = pr[a], ca = pc[a], rb = pr[b], cb = pc[b];
        if (ra == rb) res.push_back(string{sq[ra * 5 + (ca + d) % 5], sq[rb * 5 + (cb + d) % 5]});
        else if (ca == cb) res.push_back(string{sq[(ra + d) % 5 * 5 + ca], sq[(rb + d) % 5 * 5 + cb]});
        else res.push_back(string{sq[ra * 5 + cb], sq[rb * 5 + ca]});
    }
    return res;
}
string join(const vector<string> &v) {
    string s;
    for (size_t i = 0; i < v.size(); i++) s += (i ? " " : "") + v[i];
    return s;
}

int main() {
    build("PLAYFAIR EXAMPLE");
    for (int r = 0; r < 5; r++) {
        for (int c = 0; c < 5; c++) cout << (c ? " " : "") << sq[r * 5 + c];
        cout << "\n";
    }
    vector<string> c = playfair(pairsOf("HIDE THE GOLD IN THE TREE STUMP"), 1);
    cout << "cipher: " << join(c) << "\n";
    cout << "plain : " << join(playfair(c, 4)) << "\n";
}
