#include <cctype>
#include <iostream>
#include <string>
using namespace std;

// 把連續重複的字元壓成「次數 + 字元」
string rleEncode(const string& s) {
    string out;
    for (size_t i = 0; i < s.size();) {
        size_t j = i;
        while (j < s.size() && s[j] == s[i]) j++;
        out += to_string(j - i) + s[i];
        i = j;
    }
    return out;
}

string rleDecode(const string& code) {
    string out;
    int num = 0;
    for (char ch : code) {
        if (isdigit((unsigned char)ch)) num = num * 10 + (ch - '0');
        else { out += string(num, ch); num = 0; }
    }
    return out;
}

int main() {
    string s = "WWWWWWWWWWWWBWWWWWWWWWWWWBBBWWWWWWWWWWWWWWWWWWWWWWWWBWWWWWWWWWWWWWW";
    string code = rleEncode(s);
    cout << "encoded: " << code << "\nlength " << s.size() << " -> " << code.size() << ", decode ok: " << (rleDecode(code) == s ? "True" : "False") << "\n";
}
