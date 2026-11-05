#include <iostream>
#include <list>
#include <unordered_map>
#include <utility>
using namespace std;

// 雜湊表 + 雙向鏈結串列：頭端最近使用，尾端最久未用
class LRUCache {
    size_t cap;
    list<pair<int, int>> items;
    unordered_map<int, list<pair<int, int>>::iterator> pos;
public:
    LRUCache(size_t c) : cap(c) {}
    int get(int k) {
        auto it = pos.find(k);
        if (it == pos.end()) return -1;
        items.splice(items.begin(), items, it->second);
        return it->second->second;
    }
    void put(int k, int v) {
        if (cap == 0) return;
        auto it = pos.find(k);
        if (it != pos.end()) { it->second->second = v; items.splice(items.begin(), items, it->second); return; }
        if (items.size() == cap) { pos.erase(items.back().first); items.pop_back(); }
        items.push_front({k, v});
        pos[k] = items.begin();
    }
    void show() const { cout << "order:"; for (auto &p : items) cout << " " << p.first << ":" << p.second; cout << "\n"; }
};

int main() {
    LRUCache c(2);
    c.put(1, 1); c.put(2, 2);
    cout << "get 1 -> " << c.get(1) << "\n";
    c.put(3, 3);
    cout << "get 2 -> " << c.get(2) << "\n";
    c.put(4, 4);
    int a = c.get(1), b = c.get(3), d = c.get(4);
    cout << "get 1 -> " << a << " | get 3 -> " << b << " | get 4 -> " << d << "\n";
    c.put(3, 33);
    c.show();
    LRUCache z(0);
    z.put(1, 1);
    cout << "cap 0 get 1 -> " << z.get(1) << "\n";
}
