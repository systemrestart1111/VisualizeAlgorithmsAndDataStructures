#include <iostream>
#include <vector>
using namespace std;

int n = 5, k = 3, cnt = 0;
vector<int> cur;

// 從 start 開始挑下一個數，保證組合內遞增、不會重複；剩下的數不夠湊滿 k 個就剪枝
void bt(int start) {
    if ((int)cur.size() == k) {
        for (size_t i = 0; i < cur.size(); i++) cout << (i ? " " : "") << cur[i];
        cout << "\n";
        cnt++;
        return;
    }
    for (int x = start; x <= n - (k - (int)cur.size()) + 1; x++) {
        cur.push_back(x);
        bt(x + 1);
        cur.pop_back();
    }
}

int main() {
    bt(1);
    cout << "count = " << cnt << "\n";
}
