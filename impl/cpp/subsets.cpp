#include <iostream>
#include <string>
#include <vector>
using namespace std;

vector<string> items = {"a", "b", "c"}, cur;
int cnt = 0;

// 每個節點都是一個子集合：輸出目前的集合，再嘗試從 start 之後加入下一個元素
void bt(size_t start) {
    cout << "{";
    for (size_t i = 0; i < cur.size(); i++) cout << (i ? " " : "") << cur[i];
    cout << "}\n";
    cnt++;
    for (size_t i = start; i < items.size(); i++) {
        cur.push_back(items[i]);
        bt(i + 1);
        cur.pop_back();
    }
}

int main() {
    bt(0);
    cout << "count = " << cnt << "\n";
}
