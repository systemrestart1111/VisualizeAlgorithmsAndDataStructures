#include <iostream>
#include <string>
#include <vector>
using namespace std;

vector<string> items = {"1", "2", "3"};
vector<string> cur;
vector<bool> used(3);

// 每一層選一個還沒用過的元素放進目前位置，到底就輸出；返回時把它標回未使用（回溯）
void bt() {
    if (cur.size() == items.size()) {
        for (size_t i = 0; i < cur.size(); i++) cout << (i ? " " : "") << cur[i];
        cout << "\n";
        return;
    }
    for (size_t i = 0; i < items.size(); i++)
        if (!used[i]) {
            used[i] = true;
            cur.push_back(items[i]);
            bt();
            cur.pop_back();
            used[i] = false;
        }
}

int main() { bt(); }
