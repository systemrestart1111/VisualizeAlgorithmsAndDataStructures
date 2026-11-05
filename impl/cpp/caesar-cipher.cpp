#include <iostream>
#include <string>
using namespace std;

// 每個字母位移 k 格（mod 26），保留大小寫，非字母原樣輸出
string caesar(const string &text, int k) {
    k = ((k % 26) + 26) % 26;
    string out = text;
    for (char &ch : out) {
        if (ch >= 'A' && ch <= 'Z') ch = char('A' + (ch - 'A' + k) % 26);
        else if (ch >= 'a' && ch <= 'z') ch = char('a' + (ch - 'a' + k) % 26);
    }
    return out;
}

int main() {
    string msg = "Hello, World! XYZ";
    string c = caesar(msg, 3);
    cout << "encrypt k=3: " << c << "\n";
    cout << "decrypt   : " << caesar(c, -3) << "\n";
    for (int k : {0, 25, 26}) cout << "k=" << k << ": " << caesar(msg, k) << "\n";
}
